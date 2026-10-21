import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { executeCode } from "../services/codeExecutionService.js";

const SUPPORTED_LANGUAGES = ["javascript", "python", "java", "cpp"];

/**
 * POST /api/code-execution/run
 * Used by the "Run" button on coding questions for any language other
 * than JavaScript (JavaScript runs entirely client-side in a sandboxed Web
 * Worker — see frontend/src/components/ui/CodeEditor.jsx — so it never
 * needs to hit this endpoint or an external service).
 *
 * Deliberately NOT behind enforceQuota: this doesn't call the AI, so it
 * shouldn't spend a unit of the monthly AI-request plan.
 */
export const runCode = asyncHandler(async (req, res) => {
  const language = (req.body.language || "").toString().toLowerCase();
  const code = (req.body.code || "").toString();
  const stdin = (req.body.stdin || "").toString();

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AppError(`Unsupported language "${language}".`, 400);
  }
  if (code.length > 20000) {
    throw new AppError("That code is too long to execute.", 400);
  }

  const result = await executeCode({ language, code, stdin });
  res.status(200).json({ success: true, data: result });
});

export default { runCode };
