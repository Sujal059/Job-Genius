import Groq from "groq-sdk";
import AppError from "../utils/AppError.js";

// openai/gpt-oss-120b: large, strong reasoning, supports Structured Outputs
// in `strict: true` mode (guaranteed schema-conformant output via
// constrained decoding — see services/aiSchemas.js for why every schema
// here is written to that mode's constraints).
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// groq/compound: Groq's production agentic system with a built-in,
// server-side web search tool — the direct equivalent of what Gemini's
// Google Search grounding tool did for the job matcher's research step.
const SEARCH_MODEL = process.env.GROQ_SEARCH_MODEL || "groq/compound";

const DEFAULT_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS) || 60000;
const SEARCH_TIMEOUT_MS = Number(process.env.GROQ_SEARCH_TIMEOUT_MS) || 90000;

let cachedClient = null;

/**
 * Lazily creates the Groq client. Lazy so a missing API key doesn't crash
 * the whole server at boot — only the first AI-powered request will fail,
 * with a clear error telling the operator what to fix.
 */
function getClient() {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    throw new AppError(
      "The server is missing a valid GROQ_API_KEY. Add one to backend/.env and restart the server.",
      500
    );
  }

  cachedClient = new Groq({ apiKey });
  return cachedClient;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Races a promise against a manual timeout so a slow/hanging Groq call can
 * never leave an HTTP request open indefinitely. Implemented with plain
 * Promise.race (no dependency on SDK-internal abort options) so it behaves
 * the same way across SDK versions.
 */
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} took longer than ${ms}ms`);
      err.name = "AbortError";
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Pulls the message text out of a chat completion response and parses it as JSON. */
function parseJSONContent(response) {
  const choice = response?.choices?.[0];
  const content = choice?.message?.content;

  if (!content) {
    if (choice?.finish_reason === "content_filter") {
      throw new AppError(
        "The AI couldn't process this request as written. Please review your inputs and try again.",
        422
      );
    }
    throw new AppError("The AI returned an empty response. Please try again.", 502);
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new AppError(
      "The AI returned a response we couldn't parse. Please try again in a moment.",
      502,
      process.env.NODE_ENV !== "production" ? { rawPreview: content.slice(0, 500) } : undefined
    );
  }
}

function isRetryableError(err) {
  const status = typeof err.status === "number" ? err.status : null;
  return err.name === "AbortError" || err.code === "ECONNRESET" || status === 429 || (status !== null && status >= 500);
}

/**
 * generateStructuredJSON
 * -----------------------
 * The one function every controller calls for schema-constrained
 * generation. Uses Groq's Structured Outputs in `strict: true` mode —
 * constrained decoding guarantees the response matches the schema
 * exactly, so callers never need to defensively handle missing or
 * malformed fields the way best-effort JSON modes require.
 *
 * Retries once on transient failures (timeout, network reset, rate limit,
 * upstream 5xx) with a longer backoff specifically for rate limits, since
 * Groq's per-minute limits are tighter than most hosted-model APIs. Does
 * NOT retry on other 4xx errors (bad request, invalid key) since retrying
 * an identical request won't fix those.
 *
 * @param {object} params
 * @param {string} params.systemInstruction - Persona/rules for the model.
 * @param {string} params.prompt - The user-turn content (resume text, JD, etc).
 * @param {{name: string, schema: object}} params.schema - A named schema object exported from aiSchemas.js.
 * @param {string} [params.model] - Overrides GROQ_MODEL.
 * @param {number} [params.timeoutMs] - Overrides GROQ_TIMEOUT_MS.
 * @param {number} [params.maxRetries] - Defaults to 1.
 * @returns {Promise<any>} Parsed JSON matching `schema.schema`.
 */
export async function generateStructuredJSON({
  systemInstruction,
  prompt,
  schema,
  model = DEFAULT_MODEL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRetries = 1,
}) {
  const groq = getClient();
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await withTimeout(
        groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: schema.name,
              strict: true,
              schema: schema.schema,
            },
          },
        }),
        timeoutMs,
        "Groq request"
      );

      return parseJSONContent(response);
    } catch (err) {
      lastError = err;

      if (!isRetryableError(err) || attempt === maxRetries) break;

      const isRateLimited = err.status === 429;
      await sleep(isRateLimited ? 2000 * (attempt + 1) : 500 * (attempt + 1));
    }
  }

  throw lastError;
}

/**
 * generateGroundedText
 * ---------------------
 * For requests that need the AI to actually search the live web (e.g.
 * finding real, currently-open job postings) rather than generate from
 * its own training data. Uses `groq/compound`, which has a built-in,
 * server-side web search tool — the model decides on its own when to
 * search, and returns a normal text response with the research already
 * incorporated; no tool-calling loop needs to be managed on our end.
 *
 * Deliberately returns plain text, not schema-constrained JSON — Groq
 * does not currently support combining tool use with Structured Outputs
 * in one call. The caller does a second, ungrounded, schema-constrained
 * call (generateStructuredJSON, above) to structure this text.
 *
 * @returns {Promise<{text: string}>}
 */
export async function generateGroundedText({
  systemInstruction,
  prompt,
  model = SEARCH_MODEL,
  timeoutMs = SEARCH_TIMEOUT_MS,
}) {
  const groq = getClient();

  const response = await withTimeout(
    groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
    }),
    timeoutMs,
    "Groq grounded search"
  );
  
  const content = response?.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new AppError("The AI's search returned nothing usable. Please try again.", 502);
  }

  return { text: content };
}

export default { generateStructuredJSON, generateGroundedText };
