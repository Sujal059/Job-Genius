import { useEffect, useRef, useState } from "react";

/**
 * Counts down from `seconds`, ticking once per second, and calls
 * `onExpire` exactly once when it reaches 0. Resets automatically whenever
 * `seconds` changes (i.e. the parent moves to a new question) — the
 * calling page doesn't need to manually reset anything between questions.
 *
 * @param {{seconds: number, onExpire: () => void, isActive?: boolean}} params
 */
export function useCountdown({ seconds, onExpire, isActive = true }) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive) return undefined;
    if (remaining <= 0) {
      onExpireRef.current?.();
      return undefined;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, isActive]);

  return { remaining, percentRemaining: seconds > 0 ? (remaining / seconds) * 100 : 0 };
}

export default useCountdown;
