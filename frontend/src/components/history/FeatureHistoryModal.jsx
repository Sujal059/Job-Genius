import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  History,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Layers,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { AILoader } from "../ui/AILoader";
import { JobMatcherResultView } from "../results/JobMatcherResultView";
import { SkillGapResultView } from "../results/SkillGapResultView";
import { TestResults } from "../quiz/TestResults";

export function FeatureHistoryModal({
  open,
  onClose,
  title,
  feature, // 'job-matcher' | 'interview' | 'skill-assessment' | 'skill-gap'
  fetchHistory,
  onLoadIntoPage,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load past history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedItem(null);
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          onClose?.();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, selectedItem]);

  if (typeof document === "undefined" || !open) return null;

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleLoadIntoPage = (item) => {
    if (onLoadIntoPage) {
      onLoadIntoPage(item);
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className="glass-panel relative flex flex-col w-full max-w-5xl max-h-[88vh] rounded-2xl border border-line-subtle bg-elevated/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface/50">
            <div className="flex items-center gap-3">
              {selectedItem ? (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line-subtle bg-surface px-2.5 py-1 text-xs font-semibold text-muted hover:text-main hover:border-line transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to List
                </button>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 border border-accent/25 text-accent">
                  <History size={16} />
                </div>
              )}

              <div>
                <h3 className="font-display text-base font-bold text-main leading-tight">
                  {selectedItem
                    ? `${title} Detail`
                    : title || "Activity History"}
                </h3>
                <p className="text-[11px] text-faint">
                  {selectedItem
                    ? `Recorded on ${formatDate(selectedItem.createdAt)}`
                    : `${items.length} past ${items.length === 1 ? "record" : "records"} found`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedItem && onLoadIntoPage && (
                <Button
                  variant="gradient"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => handleLoadIntoPage(selectedItem)}
                  className="text-xs"
                >
                  Open in Workspace
                </Button>
              )}

              {!selectedItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={loadData}
                  disabled={loading}
                  className="text-xs text-muted hover:text-main"
                >
                  Refresh
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-faint hover:bg-surface hover:text-main transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body with internal scrolling */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {loading ? (
              <div className="py-16">
                <AILoader label="Fetching past history records..." />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-danger/30 bg-danger-soft/20 p-6 text-center">
                <p className="text-sm text-danger mb-3">{error}</p>
                <Button variant="secondary" size="sm" onClick={loadData}>
                  Try Again
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-line-subtle text-faint">
                  <Calendar size={22} />
                </div>
                <h4 className="font-display text-base font-semibold text-main mb-1">
                  No Past History Yet
                </h4>
                <p className="max-w-sm text-xs text-muted">
                  Whenever you submit this feature, results and test outcomes will be saved here so you can revisit them anytime.
                </p>
              </div>
            ) : selectedItem ? (
              /* DETAIL VIEW: Displays the EXACT full result UI */
              <div>
                {feature === "job-matcher" && (
                  <JobMatcherResultView
                    data={selectedItem}
                    onLoadIntoPage={onLoadIntoPage ? handleLoadIntoPage : null}
                    isHistoryView
                  />
                )}

                {feature === "interview" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-subtle bg-surface/80 p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken px-2.5 py-1 text-xs font-semibold text-main">
                          <Building size={13} className="text-accent" />
                          {selectedItem.companyName}
                        </span>
                        {selectedItem.jobRole && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sunken px-2.5 py-1 text-xs font-semibold text-main">
                            <Briefcase size={13} className="text-cyan-400" />
                            {selectedItem.jobRole}
                          </span>
                        )}
                      </div>
                      <Badge
                        tone={
                          selectedItem.status === "graded"
                            ? "success"
                            : selectedItem.status === "failed-proctoring"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {selectedItem.status === "graded"
                          ? `Completed · ${selectedItem.overallScore}% Score`
                          : selectedItem.status === "failed-proctoring"
                          ? "Proctoring Violation"
                          : "Incomplete Session"}
                      </Badge>
                    </div>

                    {selectedItem.status === "in-progress" ? (
                      <GlassCard className="py-12 text-center">
                        <p className="text-sm text-muted">
                          This interview session was generated on {formatDate(selectedItem.createdAt)} but was not completed or submitted for grading.
                        </p>
                      </GlassCard>
                    ) : (
                      <TestResults
                        result={selectedItem}
                        onLoadIntoPage={onLoadIntoPage ? handleLoadIntoPage : null}
                        retryLabel="Take Another Test"
                      />
                    )}
                  </div>
                )}

                {feature === "skill-assessment" && (
                  <div className="flex flex-col gap-6">
                    {selectedItem.status === "generated" ? (
                      <GlassCard className="py-12 text-center">
                        <p className="text-sm text-muted">
                          This skill assessment was generated on {formatDate(selectedItem.createdAt)} but was not submitted for grading.
                        </p>
                      </GlassCard>
                    ) : (
                      <TestResults
                        result={selectedItem}
                        onLoadIntoPage={onLoadIntoPage ? handleLoadIntoPage : null}
                        retryLabel="Take Another Assessment"
                      />
                    )}
                  </div>
                )}

                {feature === "skill-gap" && (
                  <SkillGapResultView
                    data={selectedItem}
                    onLoadIntoPage={onLoadIntoPage ? handleLoadIntoPage : null}
                    isHistoryView
                  />
                )}
              </div>
            ) : (
              /* LIST VIEW: Displays sorted, beautiful cards */
              <div className="flex flex-col gap-3">
                {items.map((item, idx) => (
                  <HistoryItemCard
                    key={item._id || idx}
                    item={item}
                    feature={feature}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function HistoryItemCard({ item, feature, onClick }) {
  const dateFormatted = formatDate(item.createdAt);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-line-subtle bg-surface/60 p-4 transition-all hover:border-accent/40 hover:bg-surface hover:shadow-glow-subtle"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          {/* Top row: Date */}
          <div className="mb-2 flex items-center gap-2 text-xs text-faint">
            <Calendar size={13} className="text-muted" />
            <span className="font-medium text-main">{dateFormatted}</span>
          </div>

          {/* Feature-specific highlights */}
          {feature === "job-matcher" && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                  <Sparkles size={12} />
                  {item.jobs?.length || 0} Matched Openings
                </span>
                {item.candidateExperienceLevel && (
                  <span className="rounded-md bg-sunken px-2 py-0.5 text-xs text-muted border border-line-subtle">
                    {item.candidateExperienceLevel}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs text-muted leading-relaxed">
                {item.candidateSummary || item.comment || "Matched tech roles based on your uploaded resume."}
              </p>
              {item.extractedSkills?.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.extractedSkills.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="rounded bg-sunken/80 px-1.5 py-0.5 text-[10px] text-faint border border-line-subtle"
                    >
                      {s}
                    </span>
                  ))}
                  {item.extractedSkills.length > 5 && (
                    <span className="text-[10px] text-faint self-center">
                      +{item.extractedSkills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {feature === "interview" && (
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-main">
                  {item.companyName}
                </span>
                {item.jobRole && (
                  <span className="text-xs text-muted">· {item.jobRole}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.status === "graded" ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                      (item.overallScore || 0) >= 80
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {item.overallScore}% Score
                  </span>
                ) : item.status === "failed-proctoring" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
                    <AlertOctagon size={12} />
                    Proctoring Violation
                  </span>
                ) : (
                  <span className="rounded-md bg-sunken px-2 py-0.5 text-xs text-faint">
                    Incomplete
                  </span>
                )}
                <span className="text-xs text-faint font-mono">
                  {item.questions?.length || 0} questions
                </span>
              </div>
            </div>
          )}

          {feature === "skill-assessment" && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {item.status === "graded" ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                      (item.overallScore || 0) >= 80
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    Verified Score: {item.overallScore}%
                  </span>
                ) : item.status === "failed-proctoring" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">
                    <AlertOctagon size={12} />
                    Proctoring Violation
                  </span>
                ) : (
                  <span className="rounded-md bg-sunken px-2 py-0.5 text-xs text-faint">
                    Incomplete
                  </span>
                )}
                <span className="text-xs text-faint font-mono">
                  {item.questions?.length || 0} technical questions
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted">
                {item.overallFeedback || "Comprehensive resume-grounded skill verification session."}
              </p>
            </div>
          )}

          {feature === "skill-gap" && (
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-main">
                  {item.companyName}
                </span>
                {item.jobRole && (
                  <span className="text-xs text-muted">· {item.jobRole}</span>
                )}
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-400">
                  ATS: {item.atsScore}%
                </span>
                <span className="rounded-md bg-accent/15 border border-accent/30 px-2 py-0.5 text-xs font-mono font-bold text-accent">
                  Chance: {item.acceptanceChance}%
                </span>
                {item.timeLeft && (
                  <span className="rounded-md bg-sunken px-2 py-0.5 text-xs text-faint border border-line-subtle">
                    {item.timeLeft}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs text-muted">
                {item.summary || "Targeted technical gap analysis and preparation roadmap."}
              </p>
            </div>
          )}
        </div>

        {/* Right side / Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-line-subtle pt-2 sm:pt-0 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
            View Full Results
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "Past Session";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Past Session";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default FeatureHistoryModal;
