import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    // The start of the current monthly billing window. When a request
    // comes in from a new calendar month, enforceQuota.js resets count to
    // 0 and bumps this forward — a "lazy reset" that needs no cron job.
    periodStart: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
    },
    // select: false — never returned from a query unless explicitly
    // requested with .select("+passwordHash"), so a stray `res.json(user)`
    // can't accidentally leak a hash to the client.
    passwordHash: { type: String, required: true, select: false },
    subscriptionPlan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "past_due", "canceled", "incomplete", "none"], default: "none" },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    usage: { type: usageSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
