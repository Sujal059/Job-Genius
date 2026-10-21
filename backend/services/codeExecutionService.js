import AppError from "../utils/AppError.js";

/**
 * Code execution for the "Run" button on coding questions.
 *
 * IMPORTANT — Piston's public API (emkc.org) stopped being freely open to
 * the public as of Feb 2026; using it now requires requesting access from
 * the maintainer, or self-hosting Piston yourself (it's open source —
 * `docker-compose up` in the engineer-man/piston repo). Either way, point
 * PISTON_API_URL at whatever instance you have access to. If it's not
 * configured or not reachable, `executeCode` throws a clear, actionable
 * error — grading a coding answer never depends on execution succeeding,
 * so this being unavailable degrades gracefully rather than breaking the
 * assessment.
 */
const PISTON_BASE_URL = process.env.PISTON_API_URL || "";

const LANGUAGE_ALIASES = {
  javascript: ["javascript", "js", "node"],
  python: ["python3", "python"],
  java: ["java"],
  cpp: ["c++", "cpp"],
};

const FILE_NAMES = {
  javascript: "main.js",
  python: "main.py",
  java: "Main.java",
  cpp: "main.cpp",
};

let runtimesCache = null;
let runtimesCacheAt = 0;
const RUNTIMES_CACHE_MS = 10 * 60 * 1000;

async function getRuntimes() {
  const now = Date.now();
  if (runtimesCache && now - runtimesCacheAt < RUNTIMES_CACHE_MS) return runtimesCache;

  const res = await fetch(`${PISTON_BASE_URL}/runtimes`);
  if (!res.ok) {
    throw new AppError(
      "Couldn't reach the code execution service. If you're using the public Piston API, note it now requires requesting access — see the README for self-hosting instructions instead.",
      502
    );
  }
  runtimesCache = await res.json();
  runtimesCacheAt = now;
  return runtimesCache;
}

function resolveRuntime(runtimes, language) {
  const aliases = LANGUAGE_ALIASES[language] || [language];
  for (const alias of aliases) {
    const match = runtimes.find((r) => r.language === alias || (r.aliases || []).includes(alias));
    if (match) return match;
  }
  return null;
}

/**
 * @param {{language: string, code: string, stdin?: string}} params
 * @returns {Promise<{stdout: string, stderr: string, compileStderr: string, exitCode: number|null}>}
 */
export async function executeCode({ language, code, stdin = "" }) {
  if (!PISTON_BASE_URL) {
    throw new AppError(
      "Live code execution isn't configured on this server. Set PISTON_API_URL in backend/.env to enable it — see the README. Your code will still be graded by AI either way.",
      503
    );
  }
  if (!code || !code.trim()) {
    throw new AppError("There's no code to run.", 400);
  }

  const runtimes = await getRuntimes();
  const runtime = resolveRuntime(runtimes, language);
  if (!runtime) {
    throw new AppError(`Live execution for "${language}" isn't available on this execution service right now.`, 400);
  }

  let res;
  try {
    res = await fetch(`${PISTON_BASE_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: FILE_NAMES[language] || "main.txt", content: code }],
        stdin,
        run_timeout: 8000,
        compile_timeout: 10000,
      }),
    });
  } catch {
    throw new AppError("Couldn't reach the code execution service.", 502);
  }

  if (res.status === 429) {
    throw new AppError("The code execution service is rate-limited right now. Please try again shortly.", 429);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AppError(`Code execution failed (${res.status}). ${text.slice(0, 200)}`.trim(), 502);
  }

  const data = await res.json();
  return {
    stdout: data.run?.stdout || "",
    stderr: data.run?.stderr || "",
    compileStderr: data.compile?.stderr || "",
    exitCode: data.run?.code ?? null,
  };
}

export default { executeCode };
