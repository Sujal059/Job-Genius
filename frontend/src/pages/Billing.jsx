import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Zap,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { UsageMeter } from "../components/ui/UsageMeter";
import { useAuth } from "../context/AuthContext";
import {
  createCheckoutSession,
  verifyCheckoutSession,
  cancelSubscription,
  updatePlan,
} from "../api/client";

const PLANS = [
  {
    id: "free",
    name: "Free Starter",
    badge: "Trial",
    price: "$0",
    period: "/month",
    description: "Explore all 4 career copilot tools with monthly complimentary AI requests.",
    limitLabel: "15 AI Requests / mo",
    features: [
      "15 AI requests per calendar month",
      "Full access to AI Job Matcher",
      "Full access to AI Mock Interviewer",
      "Full access to ATS Skill Gap Analyzer",
      "Full access to Deep Skill Assessment",
      "Unified Career Telemetry Dashboard",
    ],
    highlighted: false,
    cta: "Default Plan",
  },
  {
    id: "pro",
    name: "Pro Career",
    badge: "Most Popular",
    price: "$15",
    period: "/month",
    description: "Built for active job seekers targeting multiple enterprise loops and interview prep.",
    limitLabel: "150 AI Requests / mo",
    features: [
      "150 AI requests per calendar month (10x Free)",
      "High-priority Groq AI model routing",
      "Unlimited Job Matching with live URLs",
      "Full 16-question mock interview loops",
      "In-depth ATS diagnostics & sprint roadmaps",
      "Detailed 1-10 skill benchmarking",
      "Real-time code execution environment",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "premium",
    name: "Premium Unlimited",
    badge: "Unlimited",
    price: "$49",
    period: "/month",
    description: "Maximum bandwidth for elite career transitions, executive roles, and intensive interview sprints.",
    limitLabel: "Unlimited AI Requests",
    features: [
      "Unlimited AI requests (Zero monthly cap)",
      "Highest priority Groq AI compute slot",
      "Unlimited mock interview grading & feedback",
      "Unlimited ATS resume calibrations",
      "Full technical interview proctoring verification",
      "Dedicated early access to new AI models",
      "VIP candidate support",
    ],
    highlighted: false,
    cta: "Upgrade to Premium",
  },
];

export default function Billing() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Process Stripe redirect query params
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const plan = searchParams.get("plan");
    const canceled = searchParams.get("canceled");

    if (canceled === "true") {
      setStatusMessage({
        type: "info",
        text: "Stripe checkout session was canceled. Your plan has not changed.",
      });
      searchParams.delete("canceled");
      setSearchParams(searchParams, { replace: true });
      return;
    }

    if (success === "true" && sessionId) {
      if (sessionId.startsWith("sim_")) {
        // Discard any simulated session IDs
        searchParams.delete("success");
        searchParams.delete("session_id");
        searchParams.delete("plan");
        setSearchParams(searchParams, { replace: true });
        return;
      }

      async function completeVerification() {
        try {
          setStatusMessage({
            type: "info",
            text: "Verifying your Stripe subscription payment...",
          });
          const result = await verifyCheckoutSession(sessionId, plan);
          await refreshUser();
          setStatusMessage({
            type: "success",
            text: result.message || "Payment successful! Your subscription is now active.",
          });
          searchParams.delete("success");
          searchParams.delete("session_id");
          searchParams.delete("plan");
          setSearchParams(searchParams, { replace: true });
        } catch (err) {
          setErrorMessage(err.message || "Could not verify subscription payment.");
        }
      }
      completeVerification();
    }
  }, [searchParams, setSearchParams, refreshUser]);

  const handleSubscribe = async (planId) => {
    if (planId === user?.subscriptionPlan) return;
    setLoadingPlan(planId);
    setErrorMessage("");
    setStatusMessage(null);

    try {
      if (planId === "free") {
        // Downgrade to Free
        await cancelSubscription();
        await refreshUser();
        setStatusMessage({
          type: "success",
          text: "Your plan has been changed to Free Starter.",
        });
        return;
      }

      // Initiate real Stripe checkout session
      const res = await createCheckoutSession(planId);

      if (res.url) {
        // Redirect directly to the real Stripe Checkout page
        window.location.href = res.url;
      } else {
        throw new Error(res.message || "Failed to generate Stripe checkout URL.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to initiate subscription checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your paid subscription and revert to the Free plan?")) {
      return;
    }
    setCanceling(true);
    setErrorMessage("");
    try {
      const res = await cancelSubscription();
      await refreshUser();
      setStatusMessage({
        type: "success",
        text: res.message || "Subscription canceled. Your account has returned to Free Starter.",
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to cancel subscription.");
    } finally {
      setCanceling(false);
    }
  };

  const isCurrentPlan = (id) => (user?.subscriptionPlan || "free") === id;
  const isPaidUser = user?.subscriptionPlan === "pro" || user?.subscriptionPlan === "premium";

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <CreditCard size={14} className="text-accent" />
              Stripe Billing &amp; Quota
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-main md:text-3xl">
            Subscription &amp; Usage
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your AI plan tier, monitor your monthly request allowance, and unlock unlimited career capabilities.
          </p>
        </div>

        {isPaidUser && (
          <Button
            variant="ghost"
            size="sm"
            loading={canceling}
            onClick={handleCancelSubscription}
            className="text-muted hover:text-danger border border-line-subtle"
          >
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* ── Status Notifications ────────────────────────────────────────── */}
      {statusMessage && (
        <div
          className={clsx(
            "flex items-center gap-3 rounded-xl border p-4 text-sm font-medium",
            statusMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
          )}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          ) : (
            <RefreshCw size={18} className="shrink-0 animate-spin text-cyan-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">
          <AlertCircle size={18} className="shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Live Usage Meter & Active Status Card ────────────────────────── */}
      <GlassCard className="p-6 border-line relative overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">
                Current Plan
              </span>
              <Badge tone={isPaidUser ? "gold" : "muted"}>
                {(user?.subscriptionPlan || "free").toUpperCase()}
              </Badge>
              {user?.subscriptionStatus === "active" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={11} /> Stripe Active
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-bold text-main">
              Account Usage Status
            </h3>
            <p className="text-xs text-muted mt-1">
              Quota charges are deducted strictly upon successful completion of AI requests.
            </p>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <UsageMeter usage={user?.usage} plan={user?.subscriptionPlan || "free"} size="lg" />
          </div>
        </div>
      </GlassCard>

      {/* ── Plans Grid ───────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-main">Choose Your Plan</h2>
            <p className="text-xs text-muted">Billed monthly through Stripe. Cancel or change anytime.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-faint">
            <Lock size={12} className="text-emerald-400" />
            <span>Secure Stripe Checkout</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const current = isCurrentPlan(plan.id);
            const isLoading = loadingPlan === plan.id;

            return (
              <GlassCard
                key={plan.id}
                className={clsx(
                  "relative flex flex-col justify-between p-6 transition-all duration-200",
                  plan.highlighted
                    ? "border-accent/50 shadow-glow-accent bg-accent-soft/10 ring-1 ring-accent/30"
                    : "border-line-subtle hover:border-line",
                  current && "border-emerald-500/40 bg-emerald-500/[0.04]"
                )}
              >
                {/* Highlight Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-hover px-3 py-0.5 text-[11px] font-bold text-white shadow-glow-accent">
                      <Zap size={11} /> {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-bold text-main">{plan.name}</h3>
                    {current && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted min-h-[36px]">{plan.description}</p>

                  {/* Price */}
                  <div className="my-5 border-y border-line-subtle py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-extrabold text-main tracking-tight">
                        {plan.price}
                      </span>
                      <span className="font-mono text-xs text-muted">{plan.period}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-accent font-semibold">
                      {plan.limitLabel}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="flex flex-col gap-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-muted">
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <Check size={11} />
                        </div>
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action */}
                <div className="pt-2">
                  <Button
                    variant={current ? "secondary" : plan.highlighted ? "gradient" : "cyan"}
                    disabled={current || isLoading}
                    loading={isLoading}
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full justify-center font-semibold text-xs py-2.5"
                    icon={!current ? ArrowRight : undefined}
                  >
                    {current ? "Active Plan" : plan.cta}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* ── Stripe Security & Guarantee Banner ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3 border-t border-line-subtle pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-main">PCI-DSS Level 1 Security</h4>
            <p className="text-[11px] text-faint">Processed directly by Stripe's global network.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-main">Success-Only Billing</h4>
            <p className="text-[11px] text-faint">Requests are only counted on successful AI completion.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-main">Cancel Anytime</h4>
            <p className="text-[11px] text-faint">Switch or cancel with zero cancellation fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
