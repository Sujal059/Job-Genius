import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import { PLAN_LIMITS, VALID_PLANS } from "../config/plans.js";

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "replace_with_a_long_random_secret") {
    throw new AppError("Server is missing a valid JWT_SECRET. Set one in backend/.env.", 500);
  }
  return jwt.sign({ sub: userId.toString() }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

/** Shapes a User document into exactly what the client should ever see. */
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

export const signup = asyncHandler(async (req, res) => {
  const name = (req.body.name || "").toString().trim();
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const password = (req.body.password || "").toString();

  if (!name) throw new AppError("Name is required.", 400);
  if (!EMAIL_RE.test(email)) throw new AppError("Please enter a valid email address.", 400);
  if (password.length < 8) throw new AppError("Password must be at least 8 characters.", 400);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user._id);
  res.status(201).json({ success: true, data: { token, user: serializeUser(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").toString().trim().toLowerCase();
  const password = (req.body.password || "").toString();

  if (!email || !password) throw new AppError("Email and password are required.", 400);

  // Deliberately vague between "no such account" and "wrong password" —
  // don't help an attacker enumerate registered emails.
  const genericError = new AppError("Invalid email or password.", 401);

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw genericError;

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw genericError;

  const token = signToken(user._id);
  res.status(200).json({ success: true, data: { token, user: serializeUser(user) } });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError("User not found.", 404);
  res.status(200).json({ success: true, data: serializeUser(user) });
});

/**
 * Swaps the caller's plan instantly. This is intentionally a stand-in for
 * a real payment flow — see the README for how you'd gate this behind
 * Stripe/Razorpay/etc. instead of trusting the client to just ask for
 * "premium".
 */
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = (req.body.plan || "").toString();
  if (!VALID_PLANS.includes(plan)) {
    throw new AppError(`Unknown plan "${plan}". Valid plans: ${VALID_PLANS.join(", ")}.`, 400);
  }

  const user = await User.findByIdAndUpdate(req.userId, { subscriptionPlan: plan }, { new: true });
  if (!user) throw new AppError("User not found.", 404);

  res.status(200).json({ success: true, data: serializeUser(user) });
});

export default { signup, login, getMe, updatePlan };
