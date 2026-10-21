/**
 * The single source of truth for what each subscription tier includes.
 * Both the quota-enforcement middleware and the frontend's /me response
 * read from this, so a plan only ever needs to change in one place.
 *
 * limit === null means unlimited.
 */
export const PLAN_LIMITS = {
  free: 15,
  pro: 150,
  premium: null,
};

export const PLAN_DETAILS = {
  free: {
    id: "free",
    label: "Free",
    monthlyRequestLimit: 15,
    priceLabel: "$0/mo",
    description: "Try every tool a few times a month.",
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlyRequestLimit: 150,
    priceLabel: "$15/mo",
    description: "For an active job search.",
  },
  premium: {
    id: "premium",
    label: "Premium",
    monthlyRequestLimit: null,
    priceLabel: "$49/mo",
    description: "Unlimited AI requests.",
  },
};

export const VALID_PLANS = Object.keys(PLAN_LIMITS);

export default { PLAN_LIMITS, PLAN_DETAILS, VALID_PLANS };
