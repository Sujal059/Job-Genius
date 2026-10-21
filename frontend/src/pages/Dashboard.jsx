import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Target,
  Mic,
  Map,
  ClipboardCheck,
  FileText,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Zap,
  ShieldCheck,
  Award,
  BarChart3,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";
import { GlassCard } from "../components/ui/GlassCard";
import { AILoader } from "../components/ui/AILoader";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ScoreGauge } from "../components/charts/ScoreGauge";
import { useAuth } from "../context/AuthContext";
import { useCountUp } from "../hooks/useCountUp";
import { getDashboard } from "../api/client";

const FEATURE_CARDS = [
  {
    to: "/job-matcher",
    title: "AI Job Matcher",
    badge: "Live Tech Roles",
    description: "Scan real tech companies hiring for your exact stack with verified career portal apply links.",
    icon: Target,
    tone: "cyan",
    accentBorder: "hover:border-cyan-500/50 hover:shadow-glow-cyan",
    iconBg: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    buttonVariant: "cyan",
  },
  {
    to: "/mock-interviewer",
    title: "AI Mock Interviewer",
    badge: "Proctored Loop",
    description: "Realistic company-specific technical loops with live camera proctoring, coding runs & instant rubric feedback.",
    icon: Mic,
    tone: "indigo",
    accentBorder: "hover:border-indigo-500/50 hover:shadow-glow-accent",
    iconBg: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    buttonVariant: "gradient",
  },
  {
    to: "/skill-gap",
    title: "ATS Skill Gap & Roadmap",
    badge: "ATS Diagnostic",
    description: "Rigorous ATS keyword analysis, acceptance probability, and an actionable phased preparation sprint plan.",
    icon: Map,
    tone: "amber",
    accentBorder: "hover:border-amber-500/50 hover:shadow-glow-gold",
    iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    buttonVariant: "secondary",
  },
  {
    to: "/skill-assessment",
    title: "Deep Skill Assessment",
    badge: "1–10 Benchmark",
    description: "In-depth resume-grounded testing across MCQs and coding challenges feeding your objective skill index.",
    icon: ClipboardCheck,
    tone: "purple",
    accentBorder: "hover:border-purple-500/50 hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]",
    iconBg: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    buttonVariant: "secondary",
  },
];

function timeAgo(dateString) {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const steps = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secondsInUnit] of steps) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [skillFilter, setSkillFilter] = useState("all");

  const load = useCallback(async () => {
    setState({ loading: true, error: null, data: null });
    try {
      const data = await getDashboard();
      setState({ loading: false, error: null, data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <GlassCard glow className="py-20">
        <AILoader label="Loading your personalized career command center..." />
      </GlassCard>
    );
  }

  if (state.error) {
    return (
      <GlassCard className="text-center py-16 max-w-xl mx-auto">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <RefreshCw size={20} />
        </div>
        <h3 className="font-display text-lg font-bold text-main mb-1">Failed to load dashboard</h3>
        <p className="mb-6 text-sm text-muted">{state.error}</p>
        <Button variant="secondary" icon={RefreshCw} onClick={load}>
          Retry
        </Button>
      </GlassCard>
    );
  }

  const { hasActivity, stats, skills, recentActivity, latestResume, user: userTelemetry } = state.data;

  // Compute readiness index from candidate's verified skills
  const readinessScore =
    skills.length > 0
      ? Math.round((skills.reduce((sum, s) => sum + s.level, 0) / skills.length) * 10)
      : null;

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    if (skillFilter === "all") return true;
    if (skillFilter === "expert") return s.level >= 9;
    if (skillFilter === "advanced") return s.level >= 7 && s.level < 9;
    if (skillFilter === "intermediate") return s.level < 7;
    return true;
  });

  const activePlan = userTelemetry?.subscriptionPlan || user?.subscriptionPlan || "free";
  const quotaUsed = userTelemetry?.usage?.count ?? user?.usage?.count ?? 0;
  const quotaLimit = userTelemetry?.usage?.limit ?? (activePlan === "free" ? 15 : activePlan === "pro" ? 150 : null);
  const quotaPercent = quotaLimit ? Math.min(100, Math.round((quotaUsed / quotaLimit) * 100)) : 0;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* ── Top Header & Personalized Welcome Banner ─────────────────── */}
      <GlassCard className="p-6 md:p-8 border-line relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
                <Sparkles size={13} className="text-accent animate-pulse" />
                {greeting()}, {user?.name || "Candidate"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-line" />
              <Badge tone={activePlan === "premium" ? "gold" : activePlan === "pro" ? "accent" : "muted"}>
                {activePlan.toUpperCase()} PLAN
              </Badge>
              {userTelemetry?.subscriptionStatus === "active" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={11} /> Stripe Active
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-main md:text-3xl">
              Career Intelligence Hub
            </h1>

            <p className="mt-1 text-sm text-muted max-w-2xl">
              Strictly scoped to your profile. All metrics, skills, test results, and matched openings reflect your verified candidate activity.
            </p>

            {/* Active Resume Indicator */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {latestResume ? (
                <div className="inline-flex items-center gap-2 rounded-lg bg-surface/80 border border-line-subtle px-3 py-1.5 text-xs text-muted">
                  <FileText size={14} className="text-accent shrink-0" />
                  <span>
                    Active Resume: <strong className="text-main font-medium">{latestResume.fileName}</strong>
                  </span>
                  <span className="text-faint font-mono text-[11px]">• {timeAgo(latestResume.createdAt)}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-lg bg-accent-soft/30 border border-accent/20 px-3 py-1.5 text-xs text-accent">
                  <Sparkles size={14} className="shrink-0" />
                  <span>Upload your resume in any tool below to calibrate your AI candidate profile.</span>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Quota Mini-Card */}
          <div className="w-full lg:w-72 shrink-0 rounded-xl border border-line-subtle bg-sunken/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">
                Monthly AI Quota
              </span>
              <Link to="/billing" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                Manage <ChevronRight size={12} />
              </Link>
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-mono text-xl font-bold text-main tabular-nums">
                {quotaUsed}{" "}
                <span className="text-xs font-normal text-muted font-sans">
                  / {quotaLimit === null ? "Unlimited" : `${quotaLimit} requests`}
                </span>
              </span>
              {quotaLimit !== null && (
                <span className="font-mono text-xs text-faint tabular-nums">
                  {Math.max(0, quotaLimit - quotaUsed)} left
                </span>
              )}
            </div>

            {quotaLimit !== null ? (
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface border border-line-subtle">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    quotaPercent > 90
                      ? "bg-rose-500"
                      : quotaPercent > 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-accent to-cyan-400"
                  )}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <ShieldCheck size={14} /> Unrestricted Access
              </div>
            )}

            <p className="mt-2 text-[10px] text-faint">
              Usage updates strictly on successful AI generation.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── Core KPI Stat Highlights (4-Card High-Contrast Grid) ─────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIStatCard
          label="Matched Openings"
          value={stats.jobsMatched}
          subtext={`${stats.jobMatchRuns} AI searches executed`}
          icon={Target}
          tone="cyan"
          link="/job-matcher"
        />
        <KPIStatCard
          label="Tracked Applications"
          value={stats.jobsApplied}
          subtext="Positions marked as applied"
          icon={CheckCircle2}
          tone="emerald"
          link="/job-matcher"
        />
        <KPIStatCard
          label="Mock Interviews"
          value={stats.interviewSessions}
          subtext={stats.avgInterviewScore !== null ? `Average Score: ${stats.avgInterviewScore}%` : "Camera & code proctored"}
          icon={Mic}
          tone="indigo"
          link="/mock-interviewer"
        />
        <KPIStatCard
          label="ATS Gap & Assessments"
          value={stats.skillGapReports + stats.assessmentsCompleted}
          subtext={stats.avgAtsScore !== null ? `Average ATS Match: ${stats.avgAtsScore}%` : "Readiness benchmarked"}
          icon={Map}
          tone="amber"
          link="/skill-gap"
        />
      </div>

      {!hasActivity ? (
        /* ── Fresh Account Onboarding Checklist ────────────────────────── */
        <GlassCard className="p-8 border-line">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent border border-accent/30 mb-4 shadow-glow-accent">
              <Sparkles size={26} />
            </div>
            <h2 className="font-display text-2xl font-bold text-main">
              Welcome to JOB Genius, {user?.name?.split(" ")[0] || "Candidate"}
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Your personalized telemetry will populate here as you interact with our AI career suite. Complete your first diagnostic in under 2 minutes:
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
              <Link to="/job-matcher" className="group block">
                <div className="h-full rounded-xl border border-line-subtle bg-sunken/40 p-4 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/[0.04]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 mb-3">
                    <Target size={16} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-main group-hover:text-cyan-400 transition-colors">
                    1. Match Live Jobs
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    Upload your resume to discover real openings with direct application URLs.
                  </p>
                </div>
              </Link>

              <Link to="/mock-interviewer" className="group block">
                <div className="h-full rounded-xl border border-line-subtle bg-sunken/40 p-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/[0.04]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 mb-3">
                    <Mic size={16} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-main group-hover:text-indigo-400 transition-colors">
                    2. Practice Interview
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    Simulate a technical interview tailored to your target company.
                  </p>
                </div>
              </Link>

              <Link to="/skill-gap" className="group block">
                <div className="h-full rounded-xl border border-line-subtle bg-sunken/40 p-4 transition-all hover:border-amber-500/50 hover:bg-amber-500/[0.04]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 mb-3">
                    <Map size={16} />
                  </div>
                  <h4 className="font-display text-sm font-bold text-main group-hover:text-amber-400 transition-colors">
                    3. Run ATS Analysis
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    Check your resume's ATS match against your dream role description.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* ── Deep Skill Verification & Recent Activity Breakdown ───────── */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Skills Radar & Depth (7 cols) */}
            <GlassCard className="p-6 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-main flex items-center gap-2">
                      <Award size={18} className="text-amber-400" /> Verified Skill Index
                    </h2>
                    <p className="text-xs text-muted">
                      Objective 1–10 proficiencies compiled strictly from your assessments &amp; interview runs.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 rounded-lg bg-sunken/80 border border-line-subtle p-1 self-start sm:self-auto">
                    {[
                      { id: "all", label: "All" },
                      { id: "expert", label: "9-10" },
                      { id: "advanced", label: "7-8" },
                      { id: "intermediate", label: "1-6" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSkillFilter(tab.id)}
                        className={clsx(
                          "rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors",
                          skillFilter === tab.id
                            ? "bg-accent text-white shadow-sm"
                            : "text-muted hover:text-main"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSkills.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line-subtle bg-sunken/30 py-10 text-center">
                    <p className="text-xs text-muted">
                      No skills match the selected filter. Run a Skill Assessment or Mock Interview to verify proficiencies.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredSkills.map((s) => {
                      const levelNum = Number(s.level) || 1;
                      const levelTone =
                        levelNum >= 9 ? "emerald" : levelNum >= 7 ? "cyan" : levelNum >= 5 ? "indigo" : "amber";

                      return (
                        <div
                          key={s.skill}
                          className="rounded-xl border border-line-subtle bg-sunken/40 p-3.5 transition-all hover:border-line"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-display text-xs font-bold text-main truncate pr-2">
                              {s.skill}
                            </span>
                            <span
                              className={clsx(
                                "font-mono text-xs font-bold px-2 py-0.5 rounded-full border",
                                levelTone === "emerald" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                levelTone === "cyan" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                                levelTone === "indigo" && "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                                levelTone === "amber" && "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              )}
                            >
                              {levelNum.toFixed(1)} / 10
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface mb-2">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all duration-700",
                                levelTone === "emerald" && "bg-emerald-400",
                                levelTone === "cyan" && "bg-cyan-400",
                                levelTone === "indigo" && "bg-indigo-400",
                                levelTone === "amber" && "bg-amber-400"
                              )}
                              style={{ width: `${Math.min(100, (levelNum / 10) * 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-faint">
                            <span>{s.source}</span>
                            <span className="font-mono">{s.tier || "Verified"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-line-subtle flex items-center justify-between text-xs text-muted">
                <span>{skills.length} verified competencies calibrated</span>
                <Link to="/skill-assessment" className="text-accent hover:underline font-semibold flex items-center gap-1">
                  Test More Skills <ArrowRight size={12} />
                </Link>
              </div>
            </GlassCard>

            {/* Candidate Readiness & Recent Activity (5 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* Readiness Score Card */}
              {readinessScore !== null && (
                <GlassCard className="p-6 border-accent/20 bg-accent-soft/10 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold">
                        Overall Preparedness
                      </span>
                      <h3 className="font-display text-xl font-bold text-main mt-0.5">
                        Readiness Score
                      </h3>
                      <p className="text-xs text-muted mt-1 max-w-[210px]">
                        Aggregated technical competency index based on your recent performance.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ScoreGauge value={readinessScore} tone="gold" size={96} />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Recent Activity Feed */}
              <GlassCard className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-main flex items-center gap-2">
                        <Clock size={16} className="text-accent" /> Recent Activity
                      </h3>
                      <p className="text-xs text-muted">Your logged session timeline</p>
                    </div>
                    <span className="font-mono text-[11px] text-faint">{recentActivity.length} runs</span>
                  </div>

                  {recentActivity.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted">
                      No sessions recorded yet. Launch any tool below to begin.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {recentActivity.map((item, i) => (
                        <li key={item.id || i}>
                          <Link
                            to={item.link || "/dashboard"}
                            className="group flex items-center justify-between rounded-xl border border-line-subtle bg-sunken/40 p-3 transition-all hover:border-line hover:bg-surface/60"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={clsx(
                                    "rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase",
                                    item.tone === "emerald" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                    item.tone === "cyan" && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
                                    item.tone === "indigo" && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                                    item.tone === "purple" && "bg-purple-500/10 text-purple-400 border border-purple-500/20",
                                    item.tone === "rose" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                                    item.tone === "amber" && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  )}
                                >
                                  {item.badge}
                                </span>
                                <span className="font-mono text-[10px] text-faint">{timeAgo(item.date)}</span>
                              </div>
                              <p className="font-display text-xs font-semibold text-main group-hover:text-accent transition-colors truncate">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-muted truncate mt-0.5">{item.subtitle}</p>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className="font-mono text-xs font-bold text-main">{item.metric}</span>
                              <ChevronRight
                                size={14}
                                className="text-muted mt-1 ml-auto transition-transform group-hover:translate-x-0.5"
                              />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}

      {/* ── AI Career Suite Launchpad (4 Featured Copilot Tools) ───────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-main">AI Career Suite</h2>
            <p className="text-xs text-muted">
              Select an AI copilot to accelerate your job search and technical preparation.
            </p>
          </div>
          <span className="font-mono text-xs text-faint">4 Active Tools</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map(({ to, title, badge, description, icon: Icon, accentBorder, iconBg, buttonVariant }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <Link to={to} className="block h-full">
                <GlassCard
                  className={`group relative flex h-full flex-col justify-between p-5 transition-all duration-200 border-line-subtle ${accentBorder}`}
                >
                  <div>
                    <div className="mb-3.5 flex items-center justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                        <Icon size={20} />
                      </div>
                      <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-[10px] font-semibold text-faint border border-line-subtle">
                        {badge}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-main group-hover:text-accent transition-colors mb-2">
                      {title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">{description}</p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-line-subtle flex items-center justify-between text-xs font-semibold text-accent">
                    <span>Open Copilot</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPIStatCard({ label, value, subtext, icon: Icon, tone = "cyan", link }) {
  const animated = useCountUp(value ?? 0);

  const TONE_CLASSES = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <Link to={link || "#"} className="block group">
      <GlassCard className="p-5 flex flex-col justify-between h-full transition-all group-hover:border-line">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted tracking-tight">{label}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${TONE_CLASSES[tone]}`}>
            <Icon size={16} />
          </div>
        </div>

        <div>
          <p className="font-mono text-3xl font-extrabold text-main tabular-nums tracking-tight">
            {animated}
          </p>
          <p className="mt-1 text-[11px] text-faint truncate font-medium">{subtext}</p>
        </div>
      </GlassCard>
    </Link>
  );
}
