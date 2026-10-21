import { useState, useEffect } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AILoader } from "../components/ui/AILoader";
import { FileDropzone } from "../components/ui/FileDropzone";
import { TextField } from "../components/ui/TextField";
import { QuotaExceededNotice } from "../components/ui/QuotaExceededNotice";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { analyzeSkillGap, getSkillGapHistory } from "../api/client";
import { HistoryButton } from "../components/HistoryButton";
import { SkillGapResultView } from "../components/results/SkillGapResultView";

export default function SkillGapAnalysis() {
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [activeData, setActiveData] = useState(null);
  const { run, loading, error, errorDetails, data, reset } = useAsyncAction(analyzeSkillGap);

  useEffect(() => {
    if (data) {
      setActiveData(data);
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !companyName || !jobRole || !jobDescription || !timeLeft) return;
    run({ resumeFile: file, companyName, jobRole, jobDescription, timeLeft });
  };

  const startOver = () => {
    reset();
    setActiveData(null);
    setFile(null);
    setCompanyName("");
    setJobRole("");
    setJobDescription("");
    setTimeLeft("");
  };

  const handleLoadFromHistory = (item) => {
    reset();
    setActiveData(item);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Skill Gap Analysis & Roadmap"
          description="See exactly where your resume falls short of a role, and a plan to close the gap in time."
        />

        <HistoryButton
          title="Skill Gap History"
          feature="skill-gap"
          fetchHistory={getSkillGapHistory}
          onLoadIntoPage={handleLoadFromHistory}
        />
      </div>

      {!activeData && (
        <GlassCard glow={loading}>
          {loading ? (
            <AILoader label="Scoring your fit and building a roadmap" />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-main">Resume (PDF)</label>
                <FileDropzone file={file} onFileSelected={setFile} />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField label="Company name" value={companyName} onChange={setCompanyName} placeholder="e.g. Stripe" required />
                <TextField label="Job role" value={jobRole} onChange={setJobRole} placeholder="e.g. Backend Engineer" required />
                <TextField label="Time left to prepare" value={timeLeft} onChange={setTimeLeft} placeholder="e.g. 2 weeks" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-main">Job description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the job description here..."
                  className="w-full resize-none rounded-md border border-line bg-sunken px-3.5 py-2.5 text-sm text-main placeholder:text-faint focus:border-accent focus:outline-none"
                  required
                />
              </div>
              {error && (errorDetails?.upgradeRequired ? (
                <QuotaExceededNotice message={error} />
              ) : (
                <p className="text-sm text-danger">{error}</p>
              ))}
              <Button
                type="submit"
                variant="gradient"
                disabled={!file || !companyName || !jobRole || !jobDescription || !timeLeft}
                className="self-start px-6 font-semibold shadow-glow-accent"
              >
                Analyze Skill Gap & Build Roadmap
              </Button>
            </form>
          )}
        </GlassCard>
      )}

      {activeData && (
        <SkillGapResultView
          data={activeData}
          onStartOver={startOver}
        />
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
