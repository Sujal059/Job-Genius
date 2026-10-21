import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login, getMe, updatePlan } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

// Only the credential-guessing surface needs the strict limiter — /me and
// /plan are already behind requireAuth, which is a stronger protection
// than an IP rate limit for those.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, getMe);
router.patch("/plan", requireAuth, updatePlan);

export default router;
