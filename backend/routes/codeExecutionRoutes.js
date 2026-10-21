import { Router } from "express";
import { runCode } from "../controllers/codeExecutionController.js";

const router = Router();

// POST /api/code-execution/run — body: { language, code, stdin? }
router.post("/run", runCode);

export default router;
