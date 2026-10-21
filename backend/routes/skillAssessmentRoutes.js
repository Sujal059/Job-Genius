import { Router } from "express";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { enforceQuota } from "../middleware/enforceQuota.js";
import { generateAssessment, submitAssessment, failAssessment, getAssessmentHistory } from "../controllers/skillAssessmentController.js";

const router = Router();

// POST /api/skill-assessment/generate — multipart/form-data: resume
router.post("/generate", enforceQuota, uploadResume, generateAssessment);

// POST /api/skill-assessment/:assessmentId/submit — body: { answers: [{ index, answer, codeLanguage?, runOutput? }] }
router.post("/:assessmentId/submit", enforceQuota, submitAssessment);

// POST /api/skill-assessment/:assessmentId/fail — body: { reason, answers? } — proctoring violation, no quota spent
router.post("/:assessmentId/fail", failAssessment);

// GET /api/skill-assessment/history — fetch user's past assessments
router.get("/history", getAssessmentHistory);

export default router;
