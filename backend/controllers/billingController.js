import Stripe from "stripe";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import { PLAN_LIMITS } from "../config/plans.js";

const PLAN_PRICES = {
  pro: {
    unitAmount: 1500, // $15.00
    name: "JOB Genius Pro Plan",
    description: "150 AI requests/month, 4 full AI career copilot tools, priority analysis",
  },
  premium: {
    unitAmount: 4900, // $49.00
    name: "JOB Genius Premium Plan",
    description: "Unlimited AI requests, 4 full AI career copilot tools, top priority calibration",
  },
};

/**
 * Returns an initialized Stripe client dynamically.
 * Throws AppError(503) if STRIPE_SECRET_KEY is missing or invalid.
 */
function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "your_stripe_secret_key_here" || !stripeKey.trim()) {
    throw new AppError(
      "Stripe payment gateway is not configured. Please add your STRIPE_SECRET_KEY in backend/.env to process payments.",
      503
    );
  }
  return new Stripe(stripeKey);
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus || "none",
    usage: {
      count: user.usage?.count ?? 0,
      periodStart: user.usage?.periodStart || user.createdAt,
      limit: PLAN_LIMITS[user.subscriptionPlan],
    },
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/billing/create-checkout-session
 * Creates a real Stripe Checkout Session for recurring subscription.
 * NO SIMULATION: strictly connects to Stripe API and returns session.url.
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const planId = (req.body.planId || "").toString().toLowerCase();

  if (!["pro", "premium"].includes(planId)) {
    throw new AppError("A valid paid plan ('pro' or 'premium') is required.", 400);
  }

  const user = await User.findById(req.userId);
  if (!user) throw new AppError("Account not found. Please sign in again.", 401);

  if (user.subscriptionPlan === planId && user.subscriptionStatus === "active") {
    throw new AppError(`You are already subscribed to the ${planId.toUpperCase()} plan.`, 400);
  }

  const stripe = getStripe();
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const planInfo = PLAN_PRICES[planId];

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planInfo.name,
              description: planInfo.description,
            },
            unit_amount: planInfo.unitAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      metadata: {
        userId: user._id.toString(),
        planId,
      },
      success_url: `${clientOrigin}/billing?session_id={CHECKOUT_SESSION_ID}&success=true&plan=${planId}`,
      cancel_url: `${clientOrigin}/billing?canceled=true`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[stripe] Failed to create checkout session:", err.message);
    throw new AppError(`Stripe checkout error: ${err.message}`, 502);
  }
});

/**
 * POST /api/billing/verify-session
 * Verifies payment with Stripe API after redirect and activates subscription.
 * NO SIMULATION: strictly validates session with stripe.checkout.sessions.retrieve().
 */
export const verifyCheckoutSession = asyncHandler(async (req, res) => {
  const { sessionId, planId } = req.body;

  if (!sessionId) {
    throw new AppError("Session ID is required.", 400);
  }

  if (typeof sessionId !== "string" || sessionId.startsWith("sim_")) {
    throw new AppError("Invalid Stripe session. Simulation is disabled.", 400);
  }

  const user = await User.findById(req.userId);
  if (!user) throw new AppError("Account not found.", 401);

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" || session.status === "complete") {
      const targetPlan = session.metadata?.planId || planId || "pro";
      user.subscriptionPlan = targetPlan;
      user.subscriptionStatus = "active";
      if (session.customer) user.stripeCustomerId = String(session.customer);
      if (session.subscription) user.stripeSubscriptionId = String(session.subscription);
      await user.save();

      return res.status(200).json({
        success: true,
        message: `Payment confirmed! Welcome to ${targetPlan.toUpperCase()}.`,
        data: serializeUser(user),
      });
    }

    throw new AppError("Payment has not been completed on Stripe.", 400);
  } catch (err) {
    console.error("[stripe] Failed to verify checkout session:", err.message);
    throw new AppError(`Payment verification failed: ${err.message}`, 400);
  }
});

/**
 * POST /api/billing/cancel-subscription
 * Cancels active Stripe subscription and downgrades user to Free tier.
 */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError("Account not found.", 401);

  if (user.stripeSubscriptionId) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (err) {
      console.warn("[stripe] Subscription cancel warning:", err.message);
    }
  }

  user.subscriptionPlan = "free";
  user.subscriptionStatus = "canceled";
  user.stripeSubscriptionId = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription canceled. Your account has returned to the Free plan.",
    data: serializeUser(user),
  });
});

/**
 * POST /api/billing/webhook
 * Stripe Webhook receiver for background subscription lifecycles.
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(503).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(stripeKey);
  let event;

  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("[stripe webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    event = req.body;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.planId || "pro";

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            subscriptionPlan: "free",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          }
        );
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            { subscriptionStatus: "active" }
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: invoice.subscription },
            { subscriptionStatus: "past_due" }
          );
        }
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] Processing failed:", err);
    res.status(500).json({ error: "Webhook processing error" });
  }
};

export default {
  createCheckoutSession,
  verifyCheckoutSession,
  cancelSubscription,
  handleStripeWebhook,
};
