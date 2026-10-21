/**
 * AppError
 * ---------
 * A small, predictable error type for anything we throw on purpose
 * (bad input, missing resume, upstream AI failure, etc). Routes/controllers
 * throw these; errorMiddleware.js knows how to turn them into a clean JSON
 * response with the right HTTP status code.
 *
 * Errors that are NOT an AppError (unexpected bugs, driver failures) are
 * treated as 500s by the error middleware, so we never leak stack traces
 * or internal details for those.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable, safe to show to the client.
   * @param {number} statusCode - HTTP status code (default 400).
   * @param {object} [details] - Optional extra machine-readable context.
   */
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes "expected" errors from bugs
    if (details) this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default AppError;
