import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

/**
 * Replaces the old pseudo-identity middleware now that Job Genius has real
 * accounts. Expects `Authorization: Bearer <token>`; on success sets
 * req.userId to the user's Mongo id (the JWT's `sub` claim) exactly like
 * the old identifyUser.js did — every controller and model was already
 * written against "req.userId is a string", so nothing downstream needed
 * to change.
 */
export function requireAuth(req, res, next) {
  const header = req.get("Authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("You must be signed in to do that.", 401));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "replace_with_a_long_random_secret") {
    return next(new AppError("Server is missing a valid JWT_SECRET. Set one in backend/.env.", 500));
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.sub;
    next();
  } catch {
    next(new AppError("Your session has expired. Please sign in again.", 401));
  }
}

export default requireAuth;
