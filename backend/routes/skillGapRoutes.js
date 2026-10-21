import { Router } from "express";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { enforceQuota } from "../middleware/enforceQuota.js";
import { analyzeSkillGap, getSkillGapHistory } from "../controllers/skillGapController.js";

const router = Router();

// POST /api/skill-gap — multipart/form-data: resume, companyName, jobRole, jobDescription, timeLeft
router.post("/", enforceQuota, uploadResume, analyzeSkillGap);

// GET /api/skill-gap/history — fetch user's past skill gap analyses
router.get("/history", getSkillGapHistory);

export default router;
