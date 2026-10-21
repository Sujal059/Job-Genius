import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Target,
  Mic,
  Map,
  ClipboardCheck,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { getTheme, toggleTheme } from "../../utils/theme";
import { useAuth } from "../../context/AuthContext";
import { UsageMeter } from "../ui/UsageMeter";
import { Badge } from "../ui/Badge";
import { JobGeniusLogo } from "../ui/JobGeniusLogo";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/job-matcher", label: "Job Matcher", icon: Target },
  { to: "/mock-interviewer", label: "Mock Interviewer", icon: Mic },
  { to: "/skill-gap", label: "Skill Gap & Roadmap", icon: Map },
  { to: "/skill-assessment", label: "Skill Assessment", icon: ClipboardCheck },
];

export function Sidebar({ onNavigate }) {
  const [theme, setThemeState] = useState("dark");
  const { user, logout } = useAuth();

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line-subtle bg-surface/75 px-4 py-6 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between px-2">
        <Link to="/dashboard" onClick={onNavigate} className="group">
          <JobGeniusLogo size="md" showTagline />
        </Link>

        <Link
          to="/"
          title="Visit Public Website"
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-main transition-colors"
        >
          <Globe size={15} />
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-main font-semibold" : "text-muted hover:bg-surface/80 hover:text-main"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-lg border border-accent/30 bg-accent-soft/70 shadow-glow-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={17} className={clsx("relative z-10 shrink-0", isActive ? "text-accent" : "text-faint group-hover:text-main")} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info, Usage Meter & Controls */}
      <div className="flex flex-col gap-3 border-t border-line-subtle pt-4">
        {user && (
          <>
            <div className="flex items-center justify-between px-1">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-main">{user.name}</p>
                <p className="truncate text-xs text-faint">{user.email}</p>
              </div>
              <Badge tone={user.subscriptionPlan === "free" ? "neutral" : "accent"} className="text-[10px] uppercase font-mono">
                {user.subscriptionPlan || "free"}
              </Badge>
            </div>

            <Link to="/billing" onClick={onNavigate}>
              <UsageMeter usage={user.usage} plan={user.subscriptionPlan} size="sm" />
            </Link>

            <Link
              to="/billing"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-main"
            >
              <CreditCard size={15} />
              Manage Subscription
            </Link>
          </>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setThemeState(toggleTheme())}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-line py-2 text-xs text-muted transition-colors hover:border-line-glow hover:text-main"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button
            onClick={logout}
            title="Log out"
            className="flex items-center justify-center rounded-md border border-line p-2 text-muted transition-colors hover:border-danger/40 hover:text-danger"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
