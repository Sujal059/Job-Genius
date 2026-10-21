import clsx from "clsx";

const TONES = {
  neutral: "bg-surface text-muted border-line",
  accent: "bg-accent-soft text-accent border-accent/30",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  gold: "bg-gold-soft text-gold border-gold/30",
  success: "bg-success-soft text-success border-success/30",
  danger: "bg-danger-soft text-danger border-danger/30",
};

export function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Shared so every page tags "Hard/Medium/Easy" with the same color. */
export function difficultyTone(difficulty) {
  if (difficulty === "Hard") return "danger";
  if (difficulty === "Medium") return "gold";
  return "success"; // Easy
}

/** Shared so every page tags "Mostly Asked/Rarely Asked" the same way. */
export function frequencyTone(frequency) {
  return frequency === "Mostly Asked" ? "accent" : "neutral";
}

export default Badge;
