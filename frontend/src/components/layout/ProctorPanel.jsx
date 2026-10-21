import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import clsx from "clsx";

const STATUS_TEXT = {
  "face-detected": "Face detected — you're good.",
  "no-face": "Face not detected!",
  requesting: "Requesting camera access...",
  "loading-model": "Loading proctoring...",
  error: "Camera error",
  idle: "Proctoring inactive",
};

export function ProctorPanel({ videoRef, status, error, secondsWithoutFace, warningThresholdMs }) {
  const warningSeconds = Math.ceil(warningThresholdMs / 1000);
  const inDanger = status === "no-face" && secondsWithoutFace > 0;

  return (
    <div className="fixed bottom-5 right-5 z-40 w-40 overflow-hidden rounded-lg border border-line-subtle bg-surface/90 shadow-panel backdrop-blur-xl">
      <div className="relative aspect-[4/3] w-full bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        <div
          className={clsx(
            "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full",
            status === "face-detected" && "bg-success",
            status === "no-face" && "animate-pulse-soft bg-danger",
            (status === "requesting" || status === "loading-model") && "animate-pulse-soft bg-gold",
            status === "error" && "bg-danger"
          )}
        />
        <AnimatePresence>
          {inDanger && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-danger/85 text-center text-white"
            >
              <AlertTriangle size={18} />
              <p className="font-mono text-lg font-bold tabular-nums">
                {Math.max(0, warningSeconds - secondsWithoutFace)}s
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="px-2 py-1.5 text-center text-[0.65rem] leading-tight text-faint">
        {status === "error" ? error || STATUS_TEXT.error : STATUS_TEXT[status] || STATUS_TEXT.idle}
      </div>
    </div>
  );
}

export default ProctorPanel;
