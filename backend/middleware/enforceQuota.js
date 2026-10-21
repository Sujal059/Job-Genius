import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import { PLAN_LIMITS } from "../config/plans.js";

function isSameBillingPeriod(periodStart, now) {
  return (
    periodStart &&
    periodStart.getUTCFullYear() === now.getUTCFullYear() &&
    periodStart.getUTCMonth() === now.getUTCMonth()
  );
}

/**
 * enforceQuota
 * ------------
 * Mounted on every route that spends an AI call. Runs after requireAuth.
 * 1. Lazy monthly reset — if the user's last usage was in an earlier
 *    calendar month, count resets to 0.
 * 2. Checks current plan limit. If limit reached, immediately returns 429.
 * 3. Does NOT pre-increment usage quota before AI execution.
 * 4. Increments usage count strictly ONLY on successful AI response (HTTP 2xx).
 *    If the AI API fails, times out, throws, or returns non-2xx, quota is untouched.
 */
export const enforceQuota = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError("Your account could not be found. Please sign in again.", 401);

  const now = new Date();

  if (!isSameBillingPeriod(user.usage.periodStart, now)) {
    user.usage.count = 0;
    user.usage.periodStart = now;
    await user.save();
  }

  const limit = PLAN_LIMITS[user.subscriptionPlan];
  const quotaMessage = `You've used all ${limit} AI requests included in your ${user.subscriptionPlan} plan this month. Upgrade your plan to keep going.`;

  if (limit !== null && user.usage.count >= limit) {
    throw new AppError(quotaMessage, 429, {
      plan: user.subscriptionPlan,
      limit,
      used: user.usage.count,
      upgradeRequired: true,
    });
  }

  req.user = user;
  req.userLimit = limit;
  req._quotaRecorded = false;

  // Provide explicit quota recorder for controllers to call right after AI success
  req.recordQuotaSuccess = async () => {
    if (req._quotaRecorded) return;
    req._quotaRecorded = true;
    try {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { "usage.count": 1 } },
        { new: true }
      );
      if (updated) {
        req.usage = updated.usage;
      }
      return updated;
    } catch (err) {
      console.error("[quota] Failed to record usage count:", err.message);
    }
  };

  // Safe fallback hook on response finish:
  // ONLY if response succeeded (2xx) and controller didn't already call recordQuotaSuccess
  res.on("finish", () => {
    const succeeded = res.statusCode >= 200 && res.statusCode < 300;
    if (succeeded && !req._quotaRecorded) {
      req._quotaRecorded = true;
      User.updateOne(
        { _id: user._id },
        { $inc: { "usage.count": 1 } }
      ).catch((err) => console.error("[quota] Failed to record usage on finish:", err.message));
    }
  });

  next();
});

export default enforceQuota;
