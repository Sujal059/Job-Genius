import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AILoader } from "../components/ui/AILoader";
import { FileDropzone } from "../components/ui/FileDropzone";
import { TextField } from "../components/ui/TextField";
import { QuotaExceededNotice } from "../components/ui/QuotaExceededNotice";
import { TestRunner } from "../components/quiz/TestRunner";
import { TestResults } from "../components/quiz/TestResults";
import { useAsyncAction } from "../hooks/useAsyncAction";
import {
  getInterviewHistory,
  generateInterviewQuestions,
  gradeInterview,
  failInterview,
} from "../api/client";
import { HistoryButton } from "../components/HistoryButton";

export default function MockInterviewer() {
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [phase, setPhase] = useState("form"); // form | test | grading | grade-error | results
  const [result, setResult] = useState(null);
  const [gradeError, setGradeError] = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState(null);

  const { run, loading, error, errorDetails, data, reset } = useAsyncAction(generateInterviewQuestions);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !companyName || !jobDescription) return;
    run({ resumeFile: file, companyName, jobRole, jobDescription }).then((res) => {
      if (res?.questions?.length) setPhase("test");
    });
  };

  const attemptGrading = async (answers) => {
    setPendingAnswers(answers);
    setPhase("grading");
    setGradeError(null);
    try {
      const graded = await gradeInterview(data.sessionId, answers);
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
      const failed = await failInterview(data.sessionId, reason, answers);
      setResult(failed);
    } catch {
      setResult({
        status: "failed-proctoring",
        overallScore: 0,
        overallFeedback: "This session was ended due to a proctoring violation.",
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
    setCompanyName("");
    setJobRole("");
    setJobDescription("");
    setResult(null);
    setGradeError(null);
    setPendingAnswers(null);
    setPhase("form");
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
          title="AI Mock Interviewer"
          description="A deep, timed, proctored mock interview built from your resume, the role, and the company."
        />

        <HistoryButton
          title="Mock Interview History"
          feature="interview"
          fetchHistory={getInterviewHistory}
          onLoadIntoPage={handleLoadFromHistory}
        />
      </div>

      {phase === "form" && (
        <GlassCard glow={loading}>
          {loading ? (
            <AILoader label="Building your company-specific interview — 12 to 16 questions" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-main">Resume (PDF)</label>
                <FileDropzone file={file} onFileSelected={setFile} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Company name" value={companyName} onChange={setCompanyName} placeholder="e.g. Stripe" required />
                <TextField label="Job role" value={jobRole} onChange={setJobRole} placeholder="e.g. Senior Backend Engineer" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-main">Job description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the job description here..."
                  className="w-full resize-none rounded-md border border-line bg-sunken px-3.5 py-2.5 text-sm text-main placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
                  required
                />
              </div>
              {error && (errorDetails?.upgradeRequired ? (
                <QuotaExceededNotice message={error} />
              ) : (
                <p className="text-sm text-danger">{error}</p>
              ))}
              <Button type="submit" variant="gradient" disabled={!file || !companyName || !jobDescription} className="self-start px-6 font-semibold shadow-glow-accent">
                Generate Interview Set
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
          <AILoader label="Grading your interview" />
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
        <TestResults result={result} onStartOver={startOver} retryLabel="Practice another role" />
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
