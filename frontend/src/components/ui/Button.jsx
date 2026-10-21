import clsx from "clsx";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent-hover hover:shadow-glow-accent",
  gradient:
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white hover:brightness-110 shadow-glow-accent hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] border border-white/20",
  cyan:
    "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-400",
  secondary:
    "bg-surface text-main border border-line hover:border-line-glow hover:bg-elevated",
  ghost: "bg-transparent text-muted hover:text-main hover:bg-surface",
  danger: "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-[0.95rem] px-6 py-3 gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

export default Button;
