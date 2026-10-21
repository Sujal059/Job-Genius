import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AILoader } from "../components/ui/AILoader";
import { FileDropzone } from "../components/ui/FileDropzone";
import { QuotaExceededNotice } from "../components/ui/QuotaExceededNotice";
import { TestRunner } from "../components/quiz/TestRunner";
import { TestResults } from "../components/quiz/TestResults";
import { useAsyncAction } from "../hooks/useAsyncAction";
import {
  getAssessmentHistory,
  generateSkillAssessment,
  submitSkillAssessment,
  failAssessment,
} from "../api/client";
import { HistoryButton } from "../components/HistoryButton";

export default function SkillAssessment() {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("upload"); // upload | test | grading | grade-error | results
  const [result, setResult] = useState(null);
  const [gradeError, setGradeError] = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState(null);

  const { run, loading, error, errorDetails, data, reset } = useAsyncAction(generateSkillAssessment);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) return;
    const res = await run({ resumeFile: file });
    if (res?.questions?.length) setPhase("test");
  };

  const attemptGrading = async (answers) => {
    setPendingAnswers(answers);
    setPhase("grading");
    setGradeError(null);
    try {
      const graded = await submitSkillAssessment(data.assessmentId, answers);
      setResult(graded);
      setPhase("results");
    } catch (err) {
      setGradeError({ message: err.message, details: err.details });
      setPhase("grade-error");
    }
  };

  const handleViolation = async (reason, answers) => {
    setPhase("grading");
    try {
      const failed = await failAssessment(data.assessmentId, reason, answers);
      setResult(failed);
    } catch {
      setResult({
        status: "failed-proctoring",
        overallScore: 0,
        overallFeedback: "This assessment was ended due to a proctoring violation.",
        skillLevels: [],
        perQuestionFeedback: [],
        questions: data.questions,
      });
    } finally {
      setPhase("results");
    }
  };

  const startOver = () => {
    reset();
    setFile(null);
    setResult(null);
    setGradeError(null);
    setPendingAnswers(null);
    setPhase("upload");
  };

  const handleLoadFromHistory = (item) => {
    reset();
    setResult(item);
    setPhase("results");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Deep AI Skill Assessment"
          description="A timed, proctored test built from the exact skills on your resume — verifying what you actually know, not just what you listed."
        />

        <HistoryButton
          title="Skill Assessment History"
          feature="skill-assessment"
          fetchHistory={getAssessmentHistory}
          onLoadIntoPage={handleLoadFromHistory}
        />
      </div>

      {phase === "upload" && (
        <GlassCard glow={loading}>
          {loading ? (
            <AILoader label="Designing your resume-grounded assessment — 12 to 16 questions" />
          ) : (
            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-main">Resume (PDF)</label>
                <FileDropzone file={file} onFileSelected={setFile} />
              </div>
              {error && (errorDetails?.upgradeRequired ? (
                <QuotaExceededNotice message={error} />
              ) : (
                <p className="text-sm text-danger">{error}</p>
              ))}
              <Button type="submit" variant="gradient" disabled={!file} className="self-start px-6 font-semibold shadow-glow-accent">
                Build My Assessment
              </Button>
            </form>
          )}
        </GlassCard>
      )}

      {phase === "test" && data && (
        <TestRunner questions={data.questions} onFinish={attemptGrading} onViolation={handleViolation} />
      )}

      {phase === "grading" && (
        <GlassCard glow>
          <AILoader label="Grading your assessment" />
        </GlassCard>
      )}

      {phase === "grade-error" && (
        <GlassCard className="text-center">
          {gradeError?.details?.upgradeRequired ? (
            <QuotaExceededNotice message={gradeError.message} />
          ) : (
            <>
              <p className="mb-4 text-sm text-danger">{gradeError?.message}</p>
              <Button variant="secondary" icon={RefreshCw} onClick={() => attemptGrading(pendingAnswers)}>
                Retry grading — your answers are saved
              </Button>
            </>
          )}
        </GlassCard>
      )}

      {phase === "results" && result && (
        <TestResults result={result} onStartOver={startOver} retryLabel="Take another assessment" />
      )}
    </div>
  );
}

function PageHeader({ title, description }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-main md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
