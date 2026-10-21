import { Router } from "express";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { enforceQuota } from "../middleware/enforceQuota.js";
import { matchJobs, setJobApplied, getJobMatchHistory } from "../controllers/jobMatcherController.js";

const router = Router();

// POST /api/job-matcher — multipart/form-data: resume (file), comment (text, optional)
// enforceQuota runs before uploadResume so an over-quota request is
// rejected before we spend any time parsing the uploaded file.
router.post("/", enforceQuota, uploadResume, matchJobs);

// GET /api/job-matcher/history — all past searches, including applied state
router.get("/history", getJobMatchHistory);

// PATCH /api/job-matcher/:jobMatchId/jobs/:jobIndex/apply — body: { applied: boolean }
// Not behind enforceQuota — doesn't call the AI.
router.patch("/:jobMatchId/jobs/:jobIndex/apply", setJobApplied);

export default router;
