import { motion } from "motion/react";
import { Clock } from "lucide-react";
import clsx from "clsx";

export function QuestionTimer({ remaining, total }) {
  const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 0;
  const isLow = pct <= 20;
  const isMid = pct <= 50 && pct > 20;
  const tone = isLow ? "danger" : isMid ? "gold" : "accent";

  const minutes = Math.floor(Math.max(0, remaining) / 60);
  const seconds = Math.max(0, remaining) % 60;

  return (
    <div className="flex items-center gap-2">
      <Clock size={14} className={clsx(tone === "danger" && "text-danger", tone === "gold" && "text-gold", tone === "accent" && "text-accent")} />
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-sunken">
        <motion.div
          className={clsx("h-full rounded-full", tone === "danger" && "bg-danger", tone === "gold" && "bg-gold", tone === "accent" && "bg-accent")}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </div>
      <span className={clsx("font-mono text-xs tabular-nums", isLow ? "text-danger" : "text-muted")}>
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

export default QuestionTimer;
