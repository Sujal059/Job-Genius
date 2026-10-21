/**
 * Wraps an async Express handler so any rejected promise (thrown error,
 * failed await, etc.) is forwarded to next() instead of crashing the
 * process or hanging the request. Keeps controllers free of repeated
 * try/catch blocks.
 *
 * Usage:
 *   router.post("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
