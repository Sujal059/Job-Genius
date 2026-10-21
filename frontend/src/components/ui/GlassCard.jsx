import clsx from "clsx";

/**
 * The base surface for almost everything in Job Genius. `glow` switches on
 * the one signature "AI is actively working" border treatment — use it
 * sparingly (see globals.css .ai-active-glow), not on every card.
 */
export function GlassCard({ children, className = "", glow = false, interactive = false, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={clsx(
        interactive ? "glass-panel-interactive" : "glass-panel",
        "rounded-lg p-6",
        glow && "ai-active-glow",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default GlassCard;
