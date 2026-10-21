import multer from "multer";
import AppError from "../utils/AppError.js";

/**
 * 404 handler — mounted after all routes, before the error middleware.
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Central error handler. Every error in the app — thrown, next(err)'d, or
 * rejected inside asyncHandler — ends up here. It normalizes wildly
 * different error shapes (Mongoose, Multer, the Groq SDK, our own
 * AppError, network aborts) into one consistent JSON contract:
 *
 *   { success: false, message: string, details?: any }
 *
 * so the frontend never has to guess what an error response looks like.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== "production";

  // Always log the full error server-side for debugging.
  console.error(`[error] ${req.method} ${req.originalUrl} →`, err);

  // 1) Our own, intentionally-thrown errors.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // 2) Multer upload errors (file too large, unexpected field, etc.)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "That resume file is too large. Please upload a PDF under the size limit."
        : `Upload error: ${err.message}`;
    return res.status(400).json({ success: false, message });
  }

  // 3) Mongoose validation errors.
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Some fields did not pass validation.",
      details,
    });
  }

  // 4) Mongoose bad ObjectId / cast errors.
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for "${err.path}".`,
    });
  }

  // 5) Request aborted because a Groq call took too long.
  if (err.name === "AbortError" || err.code === "ABORT_ERR") {
    return res.status(504).json({
      success: false,
      message:
        "The AI took too long to respond. Please try again — large resumes or job descriptions can occasionally be slow.",
    });
  }

  // 6) Errors surfaced by the groq-sdk (APIError has a numeric `status`
  //    that mirrors the upstream HTTP status, same convention as the
  //    OpenAI SDK it's modeled on).
  if (typeof err.status === "number") {
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        message: "The AI service is rate-limited right now. Please wait a moment and try again.",
      });
    }
    if (err.status === 401 || err.status === 403) {
      return res.status(502).json({
        success: false,
        message:
          "The AI service rejected our credentials. Check that GROQ_API_KEY is set correctly on the server.",
      });
    }
    if (err.status >= 400 && err.status < 600) {
      return res.status(err.status === 400 ? 502 : err.status).json({
        success: false,
        message: "The AI service returned an error while processing your request.",
        ...(isDev ? { details: err.message } : {}),
      });
    }
  }

  // 7) Anything else is a genuine bug — don't leak internals in production.
  return res.status(500).json({
    success: false,
    message: "Something went wrong on our end. Please try again.",
    ...(isDev ? { details: err.message, stack: err.stack } : {}),
  });
}

export default errorHandler;
