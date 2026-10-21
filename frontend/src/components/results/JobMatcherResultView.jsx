import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Search,
  ExternalLink,
  Sparkles,
  MapPin,
  CheckCircle2,
  Circle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { setJobApplied as setJobAppliedApi } from "../../api/client";
import { useApp } from "../../context/AppContext";

export function JobMatcherResultView({
  data,
  onStartOver,
  onLoadIntoPage,
  isHistoryView = false,
}) {
  const { showToast } = useApp?.() || { showToast: () => {} };
  const [jobs, setJobs] = useState(data?.jobs || []);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const toggleApplied = async (index) => {
    const nextApplied = !jobs[index].applied;
    setJobs((prev) =>
      prev.map((j, i) => (i === index ? { ...j, applied: nextApplied } : j))
    );
    const matchId = data?.id || data?._id;
    if (matchId) {
      try {
        await setJobAppliedApi(matchId, index, nextApplied);
        showToast?.(
          nextApplied
            ? "Marked as applied! Synced to dashboard."
            : "Removed from applied list.",
          "success"
        );
      } catch (err) {
        setJobs((prev) =>
          prev.map((j, i) => (i === index ? { ...j, applied: !nextApplied } : j))
        );
        showToast?.(err.message, "error");
      }
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        job.jobRole?.toLowerCase().includes(q) ||
        job.companyName?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "direct") return job.linkType === "direct_posting";
      if (filterType === "applied") return Boolean(job.applied);
      if (filterType === "unapplied") return !job.applied;
      return true;
    });
  }, [jobs, searchQuery, filterType]);

  const activeJob = activeIndex !== null ? jobs[activeIndex] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Candidate Profile Summary Card */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <GlassCard className="flex-1 border-accent/20">
          <div className="mb-2 flex items-center gap-2 text-accent">
            <Sparkles size={16} />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">
              Analyzed Candidate Profile
            </h2>
          </div>
          <p className="mb-3 text-sm text-muted leading-relaxed">
            {data?.candidateSummary || "Profile extracted from resume."}
          </p>
          {data?.candidateExperienceLevel && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-sunken/80 px-2.5 py-1 text-xs">
              <span className="text-faint">Assessed Seniority:</span>
              <span className="font-semibold text-main">
                {data.candidateExperienceLevel}
              </span>
              <span className="text-[10px] text-faint italic">
                (excluding student internships)
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {(data?.extractedSkills || []).map((skill) => (
              <Badge key={skill} tone="cyan">
                {skill}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <div className="flex items-center gap-2 shrink-0">
          {onLoadIntoPage && (
            <Button
              variant="gradient"
              icon={ArrowRight}
              onClick={() => onLoadIntoPage(data)}
              className="text-xs"
            >
              Open in Main View
            </Button>
          )}
          {onStartOver && (
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={onStartOver}
              className="text-xs"
            >
              New Search
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-line-subtle bg-surface/80 p-3 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by role, company, or location..."
            className="w-full rounded-lg border border-line bg-sunken pl-9 pr-3 py-1.5 text-xs text-main placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Roles" },
            { id: "direct", label: "Direct Postings" },
            { id: "applied", label: "Applied" },
            { id: "unapplied", label: "Not Applied" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-main border border-line-subtle"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-faint shrink-0 px-1">
          {filteredJobs.length} of {jobs.length} jobs
        </span>
      </div>

      {/* Job Postings Grid */}
      {filteredJobs.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-sm text-muted">
            No openings match your current search filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterType("all");
            }}
            className="mt-3 text-xs text-accent hover:underline font-medium"
          >
            Clear filters
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={`${job.jobRole}-${job.companyName}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
            >
              <GlassCard
                interactive
                className={`flex h-full flex-col justify-between transition-colors ${
                  job.applied ? "border-success/40 bg-success-soft/10" : ""
                }`}
              >
                <div>
                  {/* Job Header */}
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface border border-line-subtle font-display font-bold text-sm text-accent shadow-sm">
                        {job.companyName?.slice(0, 2).toUpperCase() || "JB"}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-main leading-snug">
                          {job.jobRole}
                        </h3>
                        <p className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                          <span className="font-medium text-main">
                            {job.companyName}
                          </span>
                          <span className="opacity-40">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-faint" />
                            {job.location || "Remote / Anywhere"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-center font-mono ${
                        job.matchScore >= 90
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                      }`}
                    >
                      <p className="text-sm font-bold">{job.matchScore}%</p>
                      <p className="text-[9px] uppercase tracking-wider text-faint">
                        fit
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <Badge
                      tone={
                        job.linkType === "direct_posting"
                          ? "success"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {job.linkType === "direct_posting"
                        ? "Direct Posting"
                        : "Company Careers Portal"}
                    </Badge>
                  </div>

                  <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-muted">
                    {job.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(job.keySkillsMatched || []).slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-sunken/80 px-2 py-0.5 text-[11px] font-medium text-main border border-line-subtle"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-line-subtle">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveIndex(jobs.indexOf(job))}
                      className="flex-1 text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="gradient"
                      size="sm"
                      icon={ExternalLink}
                      onClick={() =>
                        window.open(job.applyLink, "_blank", "noopener,noreferrer")
                      }
                      className="flex-1 text-xs font-semibold"
                    >
                      Apply Now
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleApplied(jobs.indexOf(job))}
                    className={`flex items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                      job.applied
                        ? "border-success/40 bg-success-soft text-success"
                        : "border-line text-faint hover:border-line-glow hover:text-muted"
                    }`}
                  >
                    {job.applied ? (
                      <CheckCircle2 size={13} className="text-success" />
                    ) : (
                      <Circle size={13} />
                    )}
                    {job.applied
                      ? "Applied · Tracked on Dashboard"
                      : "Mark as Applied"}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        open={activeJob !== null}
        onClose={() => setActiveIndex(null)}
        title={activeJob?.jobRole}
      >
        {activeJob && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div>
                <p className="text-base font-bold text-main">
                  {activeJob.companyName}
                </p>
                <p className="text-xs text-muted">
                  {activeJob.location || "Remote / Unspecified"}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-center font-mono text-emerald-400">
                <span className="text-sm font-bold">{activeJob.matchScore}%</span>
                <span className="block text-[9px] uppercase text-faint">
                  Resume Match
                </span>
              </div>
            </div>

            <Badge
              tone={
                activeJob.linkType === "direct_posting" ? "success" : "neutral"
              }
              className="self-start text-xs"
            >
              {activeJob.linkType === "direct_posting"
                ? "Direct Posting"
                : "Company Careers Portal"}
            </Badge>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-faint mb-1">
                Role Description & Fit
              </h4>
              <p className="text-sm leading-relaxed text-main">
                {activeJob.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-faint mb-1.5">
                Matched Resume Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeJob.keySkillsMatched || []).map((skill) => (
                  <Badge key={skill} tone="cyan">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 pt-3 border-t border-line-subtle">
              <Button
                variant="gradient"
                icon={ExternalLink}
                onClick={() =>
                  window.open(
                    activeJob.applyLink,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="flex-1 justify-center font-semibold"
              >
                Go to Application Link
              </Button>
              <Button
                variant="secondary"
                onClick={() => toggleApplied(activeIndex)}
                className="flex-1 justify-center"
              >
                {activeJob.applied ? "Unmark Applied" : "Mark as Applied"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default JobMatcherResultView;
