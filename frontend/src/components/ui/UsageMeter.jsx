import { ProgressBar } from "./ProgressBar";

const PLAN_LABEL = { free: "Free", pro: "Pro", premium: "Premium" };

/**
 * @param {{count:number, limit:number|null}} usage
 * @param {"free"|"pro"|"premium"} plan
 * @param {"sm"|"lg"} size
 */
export function UsageMeter({ usage, plan, size = "sm" }) {
  const count = usage?.count ?? 0;
  const limit = usage?.limit;
  const isUnlimited = limit === null || limit === undefined;
  const isExhausted = !isUnlimited && count >= limit;

  if (size === "lg") {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-main">{PLAN_LABEL[plan] || plan} plan</p>
          <p className="font-mono text-sm text-muted">
            {isUnlimited ? `${count} requests used` : `${count} / ${limit} requests`}
          </p>
        </div>
        {!isUnlimited ? (
          <ProgressBar value={count} max={limit} tone={isExhausted ? "danger" : "accent"} showValue={false} />
        ) : (
          <p className="text-xs text-faint">Unlimited requests this month.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line px-3 py-2.5 transition-colors hover:border-line-glow">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted">{PLAN_LABEL[plan] || plan}</span>
        <span className="font-mono text-faint">{isUnlimited ? `${count} used` : `${count}/${limit}`}</span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
          <div
            className={`h-full rounded-full ${isExhausted ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default UsageMeter;
