import { useEffect, useRef } from "react";

/**
 * Fires onViolation("tab-switch") once, the first time the tab becomes
 * hidden (switched away, minimized, different app focused) while enabled.
 * Uses the standard Page Visibility API — no polling needed.
 */
export function useTabVisibility({ enabled, onViolation }) {
  const firedRef = useRef(false);

  // Always call the LATEST onViolation — see useFaceMonitor.js for why
  // this matters (otherwise a switch late in the test would report
  // whatever the answer was back when monitoring first started).
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  useEffect(() => {
    if (!enabled) return undefined;
    firedRef.current = false;

    function handleVisibilityChange() {
      if (document.hidden && !firedRef.current) {
        firedRef.current = true;
        onViolationRef.current("tab-switch");
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled]);
}

export default useTabVisibility;
