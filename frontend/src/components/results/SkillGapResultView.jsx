import { useState } from "react";
import { RotateCcw, ArrowRight, Building, Briefcase, Clock } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ScoreGauge } from "../charts/ScoreGauge";
import { SkillRadarChart } from "../charts/SkillRadarChart";

export function SkillGapResultView({
  data,
  onStartOver,
  onLoadIntoPage,
  isHistoryView = false,
}) {
  const radarData = (data?.skillsComparison || []).map((s) => ({
    skill: s.skill,
    required: s.requiredLevel,
    current: s.currentLevel,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar / Metadata */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {(data?.companyName || data?.jobRole) && (
          <div className="flex flex-wrap items-center gap-2">
            {data.companyName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-main">
                <Building size={13} className="text-accent" />
                {data.companyName}
              </span>
            )}
            {data.jobRole && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-main">
                <Briefcase size={13} className="text-cyan-400" />
                {data.jobRole}
              </span>
            )}
            {data.timeLeft && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-main">
                <Clock size={13} className="text-amber-400" />
                Target: {data.timeLeft}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
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
              New Analysis
            </Button>
          )}
        </div>
      </div>

      {/* Gauges & Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center gap-4 md:col-span-1">
          <ScoreGauge value={data?.atsScore || 0} label="ATS Score" tone="gold" />
          <ScoreGauge
            value={data?.acceptanceChance || 0}
            label="Acceptance Chance"
            tone="accent"
          />
        </GlassCard>
        <GlassCard className="md:col-span-2">
          <h2 className="mb-2 font-display text-lg font-semibold text-main">
            Where you stand
          </h2>
          <p className="text-sm leading-relaxed text-muted">{data?.summary}</p>
        </GlassCard>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 font-display text-lg font-semibold text-main">
            Required vs. your current level
          </h2>
          <SkillRadarChart data={radarData} />
        </GlassCard>
      )}

      {/* Phased Roadmap */}
      {data?.roadmap?.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-main">
            Your roadmap ({data.timeLeft || "Preparation Window"})
          </h2>
          <Roadmap phases={data.roadmap} />
        </div>
      )}
    </div>
  );
}

function Roadmap({ phases = [] }) {
  const [checked, setChecked] = useState(() =>
    phases.map((p) => (p.tasks || []).map(() => false))
  );

  const toggleTask = (phaseIndex, taskIndex) => {
    setChecked((prev) =>
      prev.map((tasks, pi) =>
        pi === phaseIndex
          ? tasks.map((t, ti) => (ti === taskIndex ? !t : t))
          : tasks
      )
    );
  };

  return (
    <div className="flex flex-col gap-0">
      {phases.map((phase, pi) => (
        <div key={pi} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface font-mono text-xs font-semibold text-accent">
              {pi + 1}
            </div>
            {pi < phases.length - 1 && (
              <div className="my-1 w-px flex-1 bg-line" />
            )}
          </div>
          <GlassCard className="mb-4 flex-1">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-main">
                {phase.phaseTitle}
              </h3>
              <span className="shrink-0 font-mono text-xs text-faint">
                {phase.timeframe}
              </span>
            </div>
            {phase.focusSkills?.length > 0 && (
              <div className="mb-3 mt-2 flex flex-wrap gap-1.5">
                {phase.focusSkills.map((s) => (
                  <Badge key={s} tone="gold">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            <ul className="mt-3 flex flex-col gap-2">
              {(phase.tasks || []).map((task, ti) => (
                <li key={ti}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked[pi]?.[ti] || false}
                      onChange={() => toggleTask(pi, ti)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-line bg-sunken accent-accent"
                    />
                    <span
                      className={
                        checked[pi]?.[ti]
                          ? "text-faint line-through"
                          : "text-muted"
                      }
                    >
                      {task}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

export default SkillGapResultView;
