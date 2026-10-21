import { motion } from "motion/react";
import clsx from "clsx";

const TONES = {
  accent: "bg-accent",
  gold: "bg-gold",
  success: "bg-success",
  danger: "bg-danger",
};

export function ProgressBar({ label, value, max = 100, tone = "accent", showValue = true, className = "" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-muted">{label}</span>}
          {showValue && <span className="font-mono text-main">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
        <motion.div
          className={clsx("h-full rounded-full", TONES[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
