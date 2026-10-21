import { motion } from "motion/react";

/**
 * The one loading state every AI feature shows while waiting on the
 * backend. Deliberately restrained — a rotating ring, a soft breathing
 * glow, and a mono-font label — rather than a busy spinner farm.
 */
export function AILoader({ label = "Thinking" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-full border-2 border-accent/15" />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full bg-accent-soft"
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      </div>
      <p className="flex items-center font-mono text-xs uppercase tracking-widest text-muted">
        {label}
        <span className="ml-0.5 inline-flex">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            >
              .
            </motion.span>
          ))}
        </span>
      </p>
    </div>
  );
}

export default AILoader;
