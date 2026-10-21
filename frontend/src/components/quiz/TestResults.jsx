import { CheckCircle2, XCircle, RotateCcw, AlertOctagon } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge, difficultyTone } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { ScoreGauge } from "../charts/ScoreGauge";

export function TestResults({ result, onStartOver, onLoadIntoPage, retryLabel = "Try again" }) {
  const failed = result?.status === "failed-proctoring";
  const feedbackByIndex = new Map(
    (result?.perQuestionFeedback || []).map((f) => [
      f.questionIndex !== undefined ? f.questionIndex : f.index,
      f,
    ])
  );

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className={failed ? "border-danger/30 bg-danger-soft/30" : undefined}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {failed ? (
            <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-full border-4 border-danger/40 bg-danger-soft">
              <AlertOctagon size={28} className="text-danger" />
              <span className="font-mono text-2xl font-bold text-danger">0</span>
            </div>
          ) : (
            <ScoreGauge value={result.overallScore} label="Overall score" tone="gold" />
          )}
          <div className="flex-1">
            <h2 className="mb-2 font-display text-lg font-semibold text-main">
              {failed ? "Test failed — proctoring violation" : "Test complete"}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{result.overallFeedback}</p>
          </div>
        </div>
      </GlassCard>

      {result.skillLevels?.length > 0 && (
        <GlassCard>
          <h2 className="mb-4 font-display text-lg font-semibold text-main">Skill levels</h2>
          <div className="flex flex-col gap-4">
            {result.skillLevels.map((s) => (
              <div key={s.skillTag}>
                <ProgressBar label={s.skillTag} value={s.level} max={10} tone="gold" />
                {s.feedback && <p className="mt-1 text-xs text-faint">{s.feedback}</p>}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {result.questions?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-main">Question breakdown</h2>
          {result.questions.map((q, i) => {
            const fb = feedbackByIndex.get(i);
            return (
              <GlassCard key={i}>
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">{q.topic}</Badge>
                  <Badge tone={difficultyTone(q.difficulty)}>{q.difficulty}</Badge>
                  {fb && (
                    <Badge tone={fb.correct ? "success" : "danger"}>
                      <span className="inline-flex items-center gap-1">
                        {fb.correct ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {fb.correct ? "Correct" : "Needs work"}
                      </span>
                    </Badge>
                  )}
                </div>
                <p className="mb-2 whitespace-pre-line text-sm font-medium text-main">{q.questionText}</p>
                <p className="mb-2 whitespace-pre-wrap rounded-md bg-sunken px-3 py-2 text-sm text-muted">
                  Your answer:{" "}
                  {q.userAnswer?.trim() ? q.userAnswer : <span className="italic text-faint">No answer given</span>}
                </p>
                {q.type === "mcq" && q.correctAnswer && (
                  <p className="mb-2 text-xs text-faint">Correct answer: {q.correctAnswer}</p>
                )}
                {fb?.feedback && <p className="text-xs text-muted">{fb.feedback}</p>}
              </GlassCard>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        {onLoadIntoPage && (
          <Button variant="gradient" onClick={() => onLoadIntoPage(result)} className="self-start text-xs">
            Open in Main View
          </Button>
        )}
        {onStartOver && (
          <Button variant="secondary" icon={RotateCcw} onClick={onStartOver} className="self-start">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default TestResults;
