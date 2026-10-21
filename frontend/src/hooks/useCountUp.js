import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up to `target` using requestAnimationFrame
 * with an ease-out curve. Re-runs whenever `target` changes, animating
 * from whatever the current displayed value is (not from 0 every time).
 */
export function useCountUp(target, durationMs = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef(null);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min(1, (timestamp - startRef.current) / durationMs);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}

export default useCountUp;
