import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Target, Mic, Map, ClipboardCheck, CheckCircle2 } from "lucide-react";
import { JobGeniusLogo } from "../ui/JobGeniusLogo";

const HIGHLIGHTS = [
  { icon: Target, text: "AI-matched jobs, sourced from live verified career portals" },
  { icon: Mic, text: "Timed, proctored mock interviews with instant AI grading" },
  { icon: Map, text: "ATS keyword screen and personalized preparation roadmap" },
  { icon: ClipboardCheck, text: "Deep skill assessment verifying your true technical depth" },
];

export function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-background text-main overflow-hidden">
      {/* ── Left Branding Panel (Desktop) ─────────────────────────────── */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden border-r border-line-subtle bg-sunken md:flex md:flex-col md:justify-between md:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture opacity-50" />
        <div className="animate-float-a pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-[120px]" />
        <div className="animate-float-b pointer-events-none absolute -bottom-32 -right-16 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-[120px]" />

        <Link to="/" className="relative z-10 inline-block group">
          <JobGeniusLogo size="lg" showTagline />
        </Link>

        <div className="relative z-10 my-auto py-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 max-w-sm font-display text-3xl font-extrabold leading-tight text-main"
          >
            Your AI copilot for landing the job you actually want.
          </motion.h1>

          <div className="flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-subtle bg-surface/80 text-cyan-400 backdrop-blur-sm">
                  <Icon size={16} />
                </div>
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 font-mono text-xs text-faint">
          <CheckCircle2 size={13} className="text-success" />
          <span>Free to start · 15 AI requests/mo · No card required</span>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Top Brand Header */}
          <div className="mb-8 flex flex-col items-center justify-center md:hidden">
            <Link to="/" className="group">
              <JobGeniusLogo size="md" showTagline />
            </Link>
          </div>

          {/* Form Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
