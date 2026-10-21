import { useCallback, useState } from "react";

/**
 * Wraps any async function with the loading/error/data bookkeeping every
 * "upload → call the AI → show results" page needs, so JobMatcher.jsx,
 * MockInterviewer.jsx, SkillGapAnalysis.jsx, and SkillAssessment.jsx don't
 * each reimplement it.
 *
 * Usage:
 *   const { run, loading, error, data } = useAsyncAction(matchJobs);
 *   <button onClick={() => run({ resumeFile, comment })}>Find matches</button>
 */
export function useAsyncAction(asyncFn) {
  const [state, setState] = useState({ loading: false, error: null, errorDetails: null, data: null });

  const run = useCallback(
    async (...args) => {
      setState({ loading: true, error: null, errorDetails: null, data: null });
      try {
        const result = await asyncFn(...args);
        setState({ loading: false, error: null, errorDetails: null, data: result });
        return result;
      } catch (err) {
        setState({
          loading: false,
          error: err.message || "Something went wrong.",
          errorDetails: err.details || null,
          data: null,
        });
        return undefined;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(
    () => setState({ loading: false, error: null, errorDetails: null, data: null }),
    []
  );

  return { ...state, run, reset };
}

export default useAsyncAction;
