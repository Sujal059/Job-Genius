import { motion } from "motion/react";
import clsx from "clsx";

const STROKE = { gold: "var(--accent-gold)", accent: "var(--primary-accent)", success: "var(--accent-success)", danger: "var(--accent-danger)" };
const GLOW_CLASS = { gold: "shadow-glow-gold", accent: "shadow-glow-accent", success: "", danger: "" };

/**
 * The app's signature visual: a precision instrument reading rather than a
 * generic progress bar, because "how ready am I, exactly" is the whole
 * value proposition of the Skill Gap feature. Gold = your score, blue =
 * anything AI-driven that isn't specifically a score.
 */
export function ScoreGauge({ value, label, tone = "gold", size = 128 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx("relative rounded-full", GLOW_CLASS[tone])}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={STROKE[tone]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-main">{Math.round(clamped)}</span>
          <span className="font-mono text-[0.65rem] text-faint">/ 100</span>
        </div>
      </div>
      {label && <p className="max-w-[10rem] text-center text-sm font-medium text-muted">{label}</p>}
    </div>
  );
}

export default ScoreGauge;
