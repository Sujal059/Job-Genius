import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Target,
  Mic,
  Map,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Camera,
  Eye,
  Clock,
  Code2,
  TrendingUp,
  Award,
  ChevronDown,
  Sun,
  Moon,
  Zap,
  Building,
  Check,
  HelpCircle,
  Play,
  Briefcase,
  Users,
  Compass,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { getTheme, toggleTheme } from "../utils/theme";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { GlassCard } from "../components/ui/GlassCard";
import { JobGeniusLogo } from "../components/ui/JobGeniusLogo";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState(getTheme());
  const [activeTab, setActiveTab] = useState("matcher");
  const [openFaq, setOpenFaq] = useState(null);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  return (
    <div className="relative min-h-screen bg-background text-main selection:bg-accent selection:text-white">
      {/* ── Background Ambient Mesh Orbs ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="bg-grid-texture absolute inset-0 opacity-40" />
        <div className="animate-float-a absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-accent/20 blur-[140px]" />
        <div className="animate-float-b absolute top-[25%] -right-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="animate-float-a absolute bottom-[10%] left-[20%] h-[30rem] w-[30rem] rounded-full bg-gold/10 blur-[130px]" />
      </div>

      {/* ── Sticky Modern Navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-line-subtle bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group inline-flex items-center">
            <JobGeniusLogo size="lg" showTagline />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-main transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-main transition-colors">
              Interactive Demo
            </a>
            <a href="#how-it-works" className="hover:text-main transition-colors">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-main transition-colors">
              Why Us
            </a>
            <a href="#pricing" className="hover:text-main transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-main transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:border-line-glow hover:text-main transition-colors"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              <Button
                variant="gradient"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gradient" size="sm" icon={Sparkles}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Landing Content ─────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col gap-24 pt-12 pb-24 md:gap-32 md:pt-20">
        {/* ── Hero Section ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft/60 px-4 py-1.5 text-xs font-medium text-accent backdrop-blur-md shadow-glow-accent"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            <span>Powered by Groq 120B Fast Reasoning Engine</span>
            <span className="font-mono opacity-60">·</span>
            <span className="text-cyan-400 font-semibold">100% Client-Side Privacy</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="max-w-4xl font-display text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]"
          >
            Land Your Dream Job <br className="hidden sm:inline" />
            <span className="gradient-text-ai">10x Faster</span> With AI Precision.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base sm:text-lg text-muted leading-relaxed"
          >
            The all-in-one career copilot that turns your resume into job offers.
            Match real live-researched openings, drill timed proctored mock
            interviews with instant feedback, and optimize your ATS keyword readiness.
          </motion.p>

          {/* Primary Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button variant="gradient" size="lg" icon={Sparkles} className="text-base font-semibold shadow-glow-accent px-8">
                {user ? "Go to Dashboard" : "Start Practicing Free"}
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="secondary" size="lg" icon={Play}>
                Explore Interactive Demo
              </Button>
            </a>
          </motion.div>

          {/* Key Value Pill Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-muted"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" /> 15 Free Monthly AI Credits
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" /> Proctored Face & Tab Monitoring
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" /> Verified Direct Apply Links
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success" /> No Credit Card Required
            </span>
          </motion.div>

          {/* ── Interactive Demo Cockpit ──────────────────────────────────── */}
          <motion.div
            id="demo"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-14 w-full max-w-5xl text-left"
          >
            <div className="relative rounded-2xl border border-line-subtle bg-surface/90 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
              {/* Cockpit Window Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle px-4 py-3 bg-sunken/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-muted">
                    job-genius-copilot.engine // preview
                  </span>
                </div>

                {/* Tab Switchers */}
                <div className="flex items-center gap-1 rounded-lg bg-surface/80 p-1 border border-line-subtle">
                  <button
                    onClick={() => setActiveTab("matcher")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      activeTab === "matcher"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-main"
                    )}
                  >
                    <Target size={13} />
                    <span>Job Matcher</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("interview")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      activeTab === "interview"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-main"
                    )}
                  >
                    <Mic size={13} />
                    <span>Mock Interview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("radar")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      activeTab === "radar"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-main"
                    )}
                  >
                    <Map size={13} />
                    <span>ATS & Roadmap</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("assessment")}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      activeTab === "assessment"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-main"
                    )}
                  >
                    <ClipboardCheck size={13} />
                    <span>Skill Benchmark</span>
                  </button>
                </div>
              </div>

              {/* Tab Display Body */}
              <div className="p-4 sm:p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === "matcher" && <InteractiveJobMatcherDemo />}
                  {activeTab === "interview" && <InteractiveInterviewDemo />}
                  {activeTab === "radar" && <InteractiveRadarDemo />}
                  {activeTab === "assessment" && <InteractiveAssessmentDemo />}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Key Metrics & Social Proof ──────────────────────────────────── */}
        <section className="border-y border-line-subtle bg-surface/40 py-12 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              <div>
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-accent">
                  94.8%
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  ATS Score Improvement
                </p>
              </div>
              <div>
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-cyan-400">
                  3.2x
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  More Interview Callbacks
                </p>
              </div>
              <div>
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-gold">
                  15+
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Verified Matches per Query
                </p>
              </div>
              <div>
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-success">
                  &lt; 2.5s
                </p>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Groq 120B AI Response Time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The 4 AI Superpowers ────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge tone="accent" className="mb-3">
              THE 4 PILLARS
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-main">
              Every Tool You Need to Land the Offer
            </h2>
            <p className="mt-3 text-muted text-base sm:text-lg">
              One resume powers your entire career progression. No fragmented apps
              or generic advice.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Feature 1 */}
            <GlassCard interactive className="flex flex-col justify-between border-l-4 border-l-cyan-500">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                    <Target size={24} />
                  </div>
                  <Badge tone="cyan">LIVE SEARCH GROUNDED</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-main mb-2">
                  AI Job Matcher with Real Openings
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Upload your resume, and Job Genius searches for active, open
                  technical roles tailored to your exact stack and seniority.
                  Every listing features verified direct application links and
                  per-job application tracking.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    10-15 real company career openings per scan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    Seniority judgment excludes internships for accurate fit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    1-click applied status syncing to your dashboard
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-line-subtle flex items-center justify-between">
                <span className="font-mono text-xs text-faint">Tool #1 / 4</span>
                <Link to="/job-matcher" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  Launch Job Matcher <ArrowRight size={13} />
                </Link>
              </div>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard interactive className="flex flex-col justify-between border-l-4 border-l-indigo-500">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Mic size={24} />
                  </div>
                  <Badge tone="accent">CLIENT-SIDE PROCTORING</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-main mb-2">
                  AI Mock Interviewer with Proctoring
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Real interview pressure with webcam face detection, tab visibility
                  tracking, and per-question countdown timers. Practice behavioral,
                  in-depth technical concepts, and coding problems with client-side
                  JavaScript sandboxing or voice dictation.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    Webcam face tracking via TensorFlow.js (100% private)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    Target company specific questions (e.g. Stripe, Google, Meta)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    Speech-to-text dictation + sandboxed live code execution
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-line-subtle flex items-center justify-between">
                <span className="font-mono text-xs text-faint">Tool #2 / 4</span>
                <Link to="/mock-interviewer" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  Practice Interview <ArrowRight size={13} />
                </Link>
              </div>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard interactive className="flex flex-col justify-between border-l-4 border-l-amber-500">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Map size={24} />
                  </div>
                  <Badge tone="gold">ROADMAP SPRINT BUILDER</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-main mb-2">
                  Skill Gap Analysis & Tailored Roadmap
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Know exactly how an automated ATS keyword scanner and hiring
                  manager evaluate your resume against a target job description.
                  Visual radar chart comparison paired with a day-by-day prep plan
                  fitted directly into your available preparation timeframe.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    Realistic ATS score + acceptance chance estimation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    Skill radar: Candidate Evidence vs Role Demands (1-10)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    Actionable sprint phases customized to your deadline
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-line-subtle flex items-center justify-between">
                <span className="font-mono text-xs text-faint">Tool #3 / 4</span>
                <Link to="/skill-gap" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  Audit Resume Fit <ArrowRight size={13} />
                </Link>
              </div>
            </GlassCard>

            {/* Feature 4 */}
            <GlassCard interactive className="flex flex-col justify-between border-l-4 border-l-emerald-500">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <ClipboardCheck size={24} />
                  </div>
                  <Badge tone="success">VERIFIED 1-10 SCORING</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-main mb-2">
                  Deep AI Skill Assessment
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Verify the skills you claim. Grounded in the technologies on your
                  resume, this test probes real architectural depth, algorithms, and
                  tooling to compute verified 1-10 skill bars that synchronize to
                  your career dashboard.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Rigorous verification of languages, frameworks & databases
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Objective MCQ scoring + AI evaluated technical answers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Permanent benchmark profile across all sessions
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-line-subtle flex items-center justify-between">
                <span className="font-mono text-xs text-faint">Tool #4 / 4</span>
                <Link to="/skill-assessment" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Benchmark Skills <ArrowRight size={13} />
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── How It Works 3-Step Flow ────────────────────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge tone="cyan" className="mb-3">
              STREAMLINED WORKFLOW
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-main">
              How Job Genius Works
            </h2>
            <p className="mt-3 text-muted text-base">
              From raw resume to multiple job offers in three systematic steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-line-subtle bg-surface/60 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 font-mono text-sm font-bold text-accent">
                01
              </div>
              <h3 className="font-display text-lg font-bold text-main mb-2">
                Drop Your Resume (PDF)
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Our parser extracts your demonstrated technical skills, seniority
                level, past impact, and project history without saving unencrypted
                data.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-line-subtle bg-surface/60 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 font-mono text-sm font-bold text-cyan-400">
                02
              </div>
              <h3 className="font-display text-lg font-bold text-main mb-2">
                Simulate, Match & Audit
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Groq 120B discovers currently active roles, generates company-specific
                proctored interviews, and calculates your precise ATS keyword gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-line-subtle bg-surface/60 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 font-mono text-sm font-bold text-emerald-400">
                03
              </div>
              <h3 className="font-display text-lg font-bold text-main mb-2">
                Land Offers With Confidence
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Walk into hiring loops prepared with verified 1-10 skill confidence,
                sound architectural phrasing, and track your applications directly.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table ────────────────────────────────────── */}
        <section id="comparison" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge tone="purple" className="mb-3">
              THE ADVANTAGE
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-main">
              Why Job Genius Beats the Old Way
            </h2>
            <p className="mt-3 text-muted text-base">
              Compare conventional job hunting methods with our AI Copilot.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line-subtle bg-surface/70 backdrop-blur-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line-subtle bg-sunken/40">
                  <th className="px-6 py-4 font-semibold text-main">Capability</th>
                  <th className="px-6 py-4 font-semibold text-accent flex items-center gap-2">
                    <Sparkles size={16} /> Job Genius AI
                  </th>
                  <th className="px-6 py-4 font-semibold text-faint">Traditional Job Boards / Prep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle text-muted">
                <tr>
                  <td className="px-6 py-4 font-medium text-main">Job Matching Quality</td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    Verified openings + true fit match score + direct application links
                  </td>
                  <td className="px-6 py-4 text-faint">Outdated listings, ghost postings, and sponsored spam</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-main">Interview Practice</td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    Proctored (webcam + tabs), timed, target company role questions with instant AI rubrics
                  </td>
                  <td className="px-6 py-4 text-faint">Static trivia cards or costly $200/hr human mock services</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-main">Resume & ATS Audit</td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    0-100 ATS keyword screen + time-bounded personalized sprint roadmap
                  </td>
                  <td className="px-6 py-4 text-faint">Generic buzzword tips and surface-level formatting notes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-main">Coding & Voice Support</td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    Sandboxed JavaScript code runner + browser Web Speech dictation
                  </td>
                  <td className="px-6 py-4 text-faint">Static text areas with zero execution or voice practice</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-main">Data Privacy</td>
                  <td className="px-6 py-4 text-cyan-400 font-medium">
                    Client-side camera processing via TF.js; video never leaves your browser
                  </td>
                  <td className="px-6 py-4 text-faint">Video recordings uploaded to third-party cloud servers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Transparent Pricing ─────────────────────────────────────────── */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge tone="gold" className="mb-3">
              SIMPLE PRICING
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-main">
              Invest in Your Next Career Move
            </h2>
            <p className="mt-3 text-muted text-base">
              Start free, then unlock higher AI quota when you are actively interviewing.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Tier */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-main">Free Starter</h3>
                <p className="mt-1 text-xs text-muted">For exploration and quick resume audits</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-main">$0</span>
                  <span className="text-xs text-muted">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> 15 AI requests per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> Live Job Matcher with apply links
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> Client-side proctored mock tests
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> ATS keyword gap & roadmap
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/signup">
                  <Button variant="secondary" className="w-full justify-center">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </GlassCard>

            {/* Pro Tier (Popular) */}
            <div className="relative rounded-xl p-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500 shadow-glow-accent">
              <div className="h-full rounded-[10px] bg-surface p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-main">Pro Career</h3>
                    <Badge tone="accent">MOST POPULAR</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">For candidates actively targeting top roles</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-main">$29</span>
                    <span className="text-xs text-muted">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-muted">
                    <li className="flex items-center gap-2 text-main font-medium">
                      <Check size={14} className="text-accent" /> 100 AI requests per month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-accent" /> Priority Groq 120B reasoning queue
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-accent" /> Unlimited mock interview practice
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-accent" /> Target company specific test banks
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-accent" /> Full interactive roadmap tracking
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link to="/billing">
                    <Button variant="gradient" className="w-full justify-center font-semibold">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Enterprise Tier */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-main">Team & Enterprise</h3>
                <p className="mt-1 text-xs text-muted">For bootcamps, university cohorts & agencies</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-main">$99</span>
                  <span className="text-xs text-muted">/ month</span>
                </div>

                <ul className="mt-6 space-y-3 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> 500 AI requests per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> Multi-seat cohort dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> Custom interview question rubrics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success" /> Dedicated API rate allocation
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link to="/billing">
                  <Button variant="secondary" className="w-full justify-center">
                    Contact Enterprise
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── FAQ Accordion ───────────────────────────────────────────────── */}
        <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge tone="neutral" className="mb-3">
              GOT QUESTIONS?
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-main">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <GlassCard key={idx} className="!p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-main hover:text-accent transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "transition-transform text-muted shrink-0",
                      openFaq === idx && "rotate-180 text-accent"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-line-subtle px-5 pb-5 pt-3 text-xs sm:text-sm text-muted leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── Final Call to Action Shimmer Banner ──────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-line-glow bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-cyan-900/40 p-8 sm:p-14 text-center backdrop-blur-2xl shadow-glow-accent">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-main tracking-tight">
              Ready to Out-Prepare Every Other Candidate?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted">
              Join thousands of software engineers, product managers, and data scientists
              accelerating their careers with Job Genius.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="gradient" size="lg" icon={Sparkles} className="text-base font-semibold px-8 shadow-glow-accent">
                  Create Your Free Account
                </Button>
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-faint">
              Instant access · 15 free AI credits · Upgrade anytime
            </p>
          </div>
        </section>
      </main>

      {/* ── Comprehensive Modern Footer ──────────────────────────────────── */}
      <footer className="border-t border-line-subtle bg-sunken/80 py-12 text-sm text-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <JobGeniusLogo size="md" />
            <p className="text-xs text-faint max-w-sm mt-1">
              The AI career copilot built with Groq 120B reasoning, client-side proctored tests,
              and live web job matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="#features" className="hover:text-main">Features</a>
            <a href="#pricing" className="hover:text-main">Pricing</a>
            <a href="#faq" className="hover:text-main">FAQ</a>
            <Link to="/login" className="hover:text-main">Sign In</Link>
            <Link to="/signup" className="hover:text-main">Create Account</Link>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Groq 120B Systems Operational</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-line-subtle flex flex-col sm:flex-row items-center justify-between text-xs text-faint gap-3">
          <p>© {new Date().getFullYear()} Job Genius Inc. All rights reserved.</p>
          <p>Built for ambitious professionals seeking top-tier roles.</p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================
   INTERACTIVE DEMO TABS
   ========================================================================= */

function InteractiveJobMatcherDemo() {
  const [applied, setApplied] = useState(false);

  return (
    <motion.div
      key="matcher"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-base font-semibold text-main">
            Live Openings Matched to Your Resume
          </h4>
          <p className="text-xs text-muted">
            15 roles found via live search matching &quot;Staff Platform / Frontend&quot;
          </p>
        </div>
        <Badge tone="cyan">15 LIVE OPENINGS</Badge>
      </div>

      <div className="rounded-xl border border-line-subtle bg-surface/90 p-4 shadow-sm hover:border-line transition-colors">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-main">
                Senior / Staff Frontend Engineer
              </span>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                98% Match
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Stripe · Remote (US / Europe) · $195,000 – $240,000 + Equity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setApplied(!applied)}
              className={clsx(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors",
                applied
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-surface text-muted border-line hover:text-main"
              )}
            >
              <CheckCircle2 size={13} className={applied ? "text-emerald-400" : "text-faint"} />
              {applied ? "Applied" : "Mark applied"}
            </button>
            <a
              href="https://stripe.com/jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
            >
              Apply <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted leading-relaxed">
          Stripe is looking for a senior front-end engineer to build high-scale financial
          dashboard components using React, TypeScript, Next.js, and Web Workers. Your resume
          strongly demonstrates performance optimization and design systems.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {["React 18", "TypeScript", "Next.js", "Web Workers", "Design Systems"].map((skill) => (
            <span key={skill} className="rounded bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line-subtle bg-surface/50 p-3 opacity-70">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-main">
            Lead Software Engineer (Distributed Systems)
          </span>
          <span className="font-mono text-xs text-accent">94% Match</span>
        </div>
        <p className="text-xs text-muted mt-0.5">Datadog · Hybrid (New York / Remote)</p>
      </div>
    </motion.div>
  );
}

function InteractiveInterviewDemo() {
  const [selected, setSelected] = useState(1);
  const options = [
    "A) Direct state mutation occurs synchronously across fiber nodes.",
    "B) Concurrent Mode divides rendering into interruptible time slices based on priority.",
    "C) It replaces the reconciliation algorithm with a single synchronous DOM repaint.",
    "D) Web workers handle all DOM manipulation without main thread involvement.",
  ];

  return (
    <motion.div
      key="interview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Proctoring Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sunken/80 border border-line-subtle px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Camera size={13} /> Camera Active: Face Centered
          </span>
          <span className="flex items-center gap-1.5 text-muted">
            <Eye size={13} /> Tab Visibility: Focused
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-amber-400">
          <Clock size={13} /> 01:45 remaining
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-xl border border-line-subtle bg-surface/90 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="accent">React Internals</Badge>
          <Badge tone="danger">Hard</Badge>
          <Badge tone="accent">Mostly Asked</Badge>
        </div>
        <p className="font-display text-sm font-semibold text-main leading-relaxed">
          How does React Concurrent Mode schedule low-priority state updates without blocking
          urgent user inputs like typing or clicking?
        </p>

        <div className="mt-4 grid gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={clsx(
                "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                selected === i
                  ? "border-accent bg-accent/15 text-main font-medium shadow-sm"
                  : "border-line bg-sunken/50 text-muted hover:border-line-glow hover:text-main"
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {selected === 1 && (
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 flex items-start gap-2">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <span>
              <strong>Correct!</strong> Concurrent Mode uses fiber-level lanes and time-slicing
              to yield control to the main thread whenever higher-priority events arrive.
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InteractiveRadarDemo() {
  return (
    <motion.div
      key="radar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="grid gap-6 sm:grid-cols-2"
    >
      <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface/90 p-5">
        <div>
          <span className="font-mono text-xs uppercase text-accent font-semibold">
            ATS Keyword Diagnostic
          </span>
          <h4 className="font-display text-lg font-bold text-main mt-1">
            Senior Frontend Engineer @ Stripe
          </h4>
          <p className="text-xs text-muted mt-1">
            Evaluated against 18 mandatory JD criteria and automated screening rubrics.
          </p>

          <div className="mt-6 flex items-center justify-around">
            <div className="text-center">
              <div className="font-mono text-3xl font-extrabold text-amber-400">92%</div>
              <span className="text-[11px] text-muted">ATS Keyword Score</span>
            </div>
            <div className="h-10 w-px bg-line-subtle" />
            <div className="text-center">
              <div className="font-mono text-3xl font-extrabold text-emerald-400">86%</div>
              <span className="text-[11px] text-muted">Acceptance Probability</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-sunken/80 p-3 text-xs text-muted">
          <strong className="text-main">Top Recommendation:</strong> Add concrete metrics
          around web vitals (e.g. LCP reduction from 2.8s to 0.9s) in your Stripe application.
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-line-subtle bg-surface/90 p-5">
        <span className="font-mono text-xs uppercase text-cyan-400 font-semibold">
          Sprint Preparation Roadmap (2-Week Plan)
        </span>

        <div className="space-y-2 text-xs">
          <div className="rounded-lg border border-line-subtle bg-sunken/60 p-2.5">
            <div className="flex items-center justify-between font-semibold text-main">
              <span>Phase 1: Concurrency & State Sync</span>
              <span className="font-mono text-[11px] text-accent">Days 1–5</span>
            </div>
            <p className="mt-1 text-muted text-[11px]">
              Master React 18 transitions, useDeferredValue, and custom scheduler queues.
            </p>
          </div>

          <div className="rounded-lg border border-line-subtle bg-sunken/60 p-2.5">
            <div className="flex items-center justify-between font-semibold text-main">
              <span>Phase 2: System Design for Financial UIs</span>
              <span className="font-mono text-[11px] text-accent">Days 6–10</span>
            </div>
            <p className="mt-1 text-muted text-[11px]">
              Design resilient idempotent payment flows with offline recovery.
            </p>
          </div>

          <div className="rounded-lg border border-line-subtle bg-sunken/60 p-2.5">
            <div className="flex items-center justify-between font-semibold text-main">
              <span>Phase 3: Final Behavioral & Values Prep</span>
              <span className="font-mono text-[11px] text-accent">Days 11–14</span>
            </div>
            <p className="mt-1 text-muted text-[11px]">
              Practice cross-functional alignment and trade-off defense questions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveAssessmentDemo() {
  const skills = [
    { name: "TypeScript & Typing Systems", level: 9 },
    { name: "React Architecture & Fiber", level: 8 },
    { name: "Node.js & Microservices", level: 8 },
    { name: "Distributed Systems & Caching", level: 7 },
    { name: "PostgreSQL & Database Design", level: 8 },
  ];

  return (
    <motion.div
      key="assessment"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-base font-semibold text-main">
            Verified Technical Depth Profile
          </h4>
          <p className="text-xs text-muted">
            Ground-truth 1–10 levels measured across MCQ, typed technical, and coding runs.
          </p>
        </div>
        <Badge tone="success">TOP 8% CANDIDATE POOL</Badge>
      </div>

      <div className="space-y-3 rounded-xl border border-line-subtle bg-surface/90 p-4">
        {skills.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between text-xs font-medium text-main mb-1">
              <span>{s.name}</span>
              <span className="font-mono text-accent">{s.level} / 10</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sunken overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                style={{ width: `${s.level * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const FAQS = [
  {
    q: "How does the AI Job Matcher find real, open jobs?",
    a: "Job Genius analyzes your resume skills and queries verified tech career portals (such as Greenhouse, Lever, Workday, LinkedIn, and company career pages) to surface currently hiring roles with legitimate apply links and fit scores.",
  },
  {
    q: "Is the webcam video during mock interviews saved or sent anywhere?",
    a: "No! All webcam and face detection is processed 100% locally in your browser using TensorFlow.js (tfjs runtime). No video frames, audio recordings, or camera streams are ever sent to our servers or stored.",
  },
  {
    q: "How does the ATS Keyword screen work?",
    a: "We simulate modern Applicant Tracking System algorithms (Workday, Greenhouse, Taleo) by comparing the specific hard skills, certifications, and phrasing in your target Job Description against your resume text.",
  },
  {
    q: "What coding languages are supported in mock interviews?",
    a: "JavaScript executes client-side in a sandboxed Web Worker. Non-JS languages (Python, Java, C++) are supported for syntax editing and graded by the AI reasoning model on methodology, edge cases, and algorithmic correctness.",
  },
  {
    q: "What AI model powers Job Genius?",
    a: "Job Genius uses Groq's high-throughput Llama & 120B reasoning models running in strict Structured Output mode. This provides guaranteed JSON schema responses with sub-3 second latency.",
  },
  {
    q: "Can I use Job Genius completely for free?",
    a: "Yes! Every account starts with 15 free AI requests every month. There is no credit card required to sign up, explore matched jobs, or complete proctored mock interview sessions.",
  },
];
