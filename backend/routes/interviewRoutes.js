import { Router } from "express";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { enforceQuota } from "../middleware/enforceQuota.js";
import { generateInterviewQuestions, gradeInterview, failInterview, getInterviewHistory } from "../controllers/interviewController.js";

const router = Router();

// POST /api/interview/questions — multipart/form-data: resume, companyName, jobDescription, jobRole
router.post("/questions", enforceQuota, uploadResume, generateInterviewQuestions);

// POST /api/interview/:sessionId/grade — body: { answers: [{ index, answer, codeLanguage?, runOutput? }] }
router.post("/:sessionId/grade", enforceQuota, gradeInterview);

// POST /api/interview/:sessionId/fail — body: { reason, answers? } — proctoring violation, no quota spent
router.post("/:sessionId/fail", failInterview);

// GET /api/interview/history — fetch user's past interview sessions
router.get("/history", getInterviewHistory);

export default router;
