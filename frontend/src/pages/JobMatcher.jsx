import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AILoader } from "../components/ui/AILoader";
import { FileDropzone } from "../components/ui/FileDropzone";
import { QuotaExceededNotice } from "../components/ui/QuotaExceededNotice";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { matchJobs, getJobMatchHistory } from "../api/client";
import { HistoryButton } from "../components/HistoryButton";
import { JobMatcherResultView } from "../components/results/JobMatcherResultView";

export default function JobMatcher() {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [activeData, setActiveData] = useState(null);
  const { run, loading, error, errorDetails, data, reset } = useAsyncAction(matchJobs);

  useEffect(() => {
    if (data) {
      setActiveData(data);
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    run({ resumeFile: file, comment });
  };

  const startOver = () => {
    reset();
    setActiveData(null);
    setFile(null);
    setComment("");
  };

  const handleLoadFromHistory = (item) => {
    reset();
    setActiveData({
      id: item._id || item.id,
      _id: item._id || item.id,
      candidateSummary: item.candidateSummary,
      candidateExperienceLevel: item.candidateExperienceLevel,
      extractedSkills: item.extractedSkills,
      jobs: item.jobs || [],
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="AI Job Matcher"
          description="Upload your resume and Job Genius uncovers active, verified tech openings matched to your exact stack."
        />

        <HistoryButton
          title="Job Matcher History"
          feature="job-matcher"
          fetchHistory={getJobMatchHistory}
          onLoadIntoPage={handleLoadFromHistory}
        />
      </div>

      {!activeData && (
        <GlassCard glow={loading}>
          {loading ? (
            <AILoader label="Analyzing resume & matching live career opportunities..." />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-main">Resume (PDF)</label>
                  <span className="text-xs text-faint">PDF files up to 8MB</span>
                </div>
                <FileDropzone file={file} onFileSelected={setFile} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-main">
                  Preferences / Target Search <span className="text-faint">(optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="e.g. Remote only, senior frontend / platform roles, fintech, AI tooling startups..."
                  className="w-full resize-none rounded-md border border-line bg-sunken px-3.5 py-2.5 text-sm text-main placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {error && (
                errorDetails?.upgradeRequired ? (
                  <QuotaExceededNotice message={error} />
                ) : (
                  <p className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                    {error}
                  </p>
                )
              )}

              <Button
                type="submit"
                variant="gradient"
                icon={Search}
                disabled={!file}
                className="self-start px-6 font-semibold shadow-glow-accent"
              >
                Find Matching Roles
              </Button>
            </form>
          )}
        </GlassCard>
      )}

      {activeData && (
        <JobMatcherResultView
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
      <h1 className="font-display text-2xl font-bold text-main md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
