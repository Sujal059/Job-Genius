import clsx from "clsx";

/**
 * JOB Genius Vector SVG Brand Logo Component
 * Combines an interlocking high-tech AI neural hexagon, modern stylized monogram,
 * and typographic wordmark: "JOB Genius".
 *
 * @param {object} props
 * @param {"full" | "icon" | "stacked"} [props.variant="full"]
 * @param {"sm" | "md" | "lg" | "xl"} [props.size="md"]
 * @param {string} [props.className]
 * @param {boolean} [props.showTagline=false]
 */
export function JobGeniusLogo({
  variant = "full",
  size = "md",
  className = "",
  showTagline = false,
}) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 52,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const px = iconSizes[size] || 32;

  const IconElement = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="jg-logo-main" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="jg-logo-inner" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="jg-logo-glow" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
        </linearGradient>
        <filter id="jg-logo-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#6366F1" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Tech Hexagon Shield */}
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        fill="#0B1120"
        stroke="url(#jg-logo-main)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Internal Radial Geometry */}
      <path
        d="M24 4V44M6 14L42 34M6 34L42 14"
        stroke="url(#jg-logo-glow)"
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />

      {/* Monogram Interlocking "J" & "G" */}
      <path
        d="M20 15H27V28.5C27 32 24.5 34.5 21 34.5C18 34.5 15.5 32.8 14.8 30.5"
        stroke="url(#jg-logo-main)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 21C31.5 17.5 27.8 15 23.5 15C18 15 13.5 19.5 13.5 25C13.5 30.5 18 35 23.5 35C28.5 35 32.2 31.8 33 27H23.5"
        stroke="url(#jg-logo-inner)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#jg-logo-shadow)"
      />

      {/* Quantum Pulse Nodes */}
      <circle cx="24" cy="24" r="2.5" fill="#22D3EE" />
      <circle cx="33" cy="27" r="1.8" fill="#F59E0B" />
    </svg>
  );

  if (variant === "icon") {
    return <div className={clsx("inline-flex items-center justify-center", className)}>{IconElement}</div>;
  }

  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {IconElement}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={clsx(
              "font-display font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent",
              textSizes[size]
            )}
          >
            JOB
          </span>
          <span className={clsx("font-display font-bold tracking-tight text-main", textSizes[size])}>
            Genius
          </span>
          <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-accent">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint mt-0.5">
            Career Copilot
          </span>
        )}
      </div>
    </div>
  );
}

export default JobGeniusLogo;
