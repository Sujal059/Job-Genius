import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";
import requireAuth from "./middleware/requireAuth.js";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import jobMatcherRoutes from "./routes/jobMatcherRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import skillAssessmentRoutes from "./routes/skillAssessmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import codeExecutionRoutes from "./routes/codeExecutionRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import { handleStripeWebhook } from "./controllers/billingController.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Core middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));

// Stripe webhook requires raw body for cryptographic signature verification
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json({ limit: "1mb" })); // resumes go through multer, not JSON, so this stays small
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Health check (public) ────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Job Genius API is running." });
});

// ── Auth (public: signup/login. /me and /plan protect themselves) ───────
app.use("/api/auth", authRoutes);

// Everything mounted below this line requires a valid `Authorization:
// Bearer <token>` header — see middleware/requireAuth.js. Real accounts
// replaced the old pseudo-identity system; every model/controller still
// just sees `req.userId` as a plain string, so nothing downstream changed.
app.use("/api", requireAuth);

// ── Feature routes (protected; some also gated by enforceQuota) ─────────
app.use("/api/job-matcher", jobMatcherRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/skill-assessment", skillAssessmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/code-execution", codeExecutionRoutes);
app.use("/api/billing", billingRoutes);

// ── 404 + centralized error handling (must be last) ─────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────
async function start() {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    console.warn(
      "\n⚠️  GROQ_API_KEY is not set. The API will start, but every AI feature will fail until you add a real key to backend/.env.\n"
    );
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
    console.warn(
      "\n⚠️  JWT_SECRET is not set (or is still the placeholder). Signup/login will fail until you set a real secret in backend/.env — try: openssl rand -base64 32\n"
    );
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err.message);
    console.error("  Check MONGODB_URI in backend/.env and that MongoDB is running.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.info(`✓ Job Genius API listening on http://localhost:${PORT}`);
  });
}

start();
