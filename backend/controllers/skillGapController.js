import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.js";
import { generateStructuredJSON } from "../services/groqClient.js";
import { skillGapSchema } from "../services/aiSchemas.js";
import Resume from "../models/Resume.js";
import SkillGapReport from "../models/SkillGapReport.js";

const SYSTEM_INSTRUCTION = `You are a principal technical hiring manager, ATS algorithm specialist, and elite career strategist inside Job Genius.
Given a candidate's resume, target job description, and available preparation window, you evaluate the exact technical fit and deliver a high-impact roadmap.

Rules:
- atsScore: A rigorous 0-100 score modeling modern enterprise ATS screening (Workday, Greenhouse, Taleo) by comparing hard technical skills, tooling, certifications, and phrasing against the job description.
- acceptanceChance: A realistic 0-100 probability of getting an offer given the resume as-is, accounting for competition and seniority expectations.
- summary: 2-4 concise, high-value sentences detailing the candidate's biggest technical differentiator and the single most critical gap to address before interviewing.
- skillsComparison: Identify the 6-10 most critical competencies for this specific role. Rate requiredLevel (what the role demands) and currentLevel (what the resume proves) on a 1-10 scale.
- roadmap: Build an actionable, phased sprint plan that realistically fits inside the candidate's stated time-left window. Each phase must include a descriptive phaseTitle, timeframe (e.g. "Days 1–4"), focusSkills, and specific executable tasks (e.g. "Build an idempotent Stripe webhook handler using Redis distributed locks", not vague advice).

Respond only with JSON matching the provided schema.`;

export const analyzeSkillGap = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please attach your resume as a PDF file.", 400);
  }

  const companyName = (req.body.companyName || "").toString().trim();
  const jobRole = (req.body.jobRole || "").toString().trim();
  const jobDescription = (req.body.jobDescription || "").toString().trim();
  const timeLeft = (req.body.timeLeft || "").toString().trim();

  if (!companyName) throw new AppError("Company name is required.", 400);
  if (!jobRole) throw new AppError("Job role is required.", 400);
  if (!jobDescription) throw new AppError("Job description is required.", 400);
  if (!timeLeft) throw new AppError("Time left for preparation is required (e.g. \"2 weeks\").", 400);

  const { text: resumeText, pageCount } = await parseResumePdf(req.file.buffer);

  const prompt = `TARGET COMPANY: ${companyName}
TARGET ROLE: ${jobRole}
TIME LEFT TO PREPARE: ${timeLeft}

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 6000)}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

Produce the ATS score, acceptance chance, skills comparison, and a
preparation roadmap that fits inside "${timeLeft}".`;

  const result = await generateStructuredJSON({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    schema: skillGapSchema,
  });

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  const [, report] = await Promise.all([
    Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: resumeText,
      pageCount,
      sourceFeature: "skill-gap",
    }).catch((err) => console.error("[skill-gap] failed to snapshot resume:", err.message)),
    SkillGapReport.create({
      userId: req.userId,
      companyName,
      jobRole,
      jobDescription,
      timeLeft,
      atsScore: clampScore(result.atsScore),
      acceptanceChance: clampScore(result.acceptanceChance),
      summary: result.summary || "",
      skillsComparison: result.skillsComparison || [],
      roadmap: result.roadmap || [],
    }),
  ]);

  res.status(200).json({ success: true, data: report });
});

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const getSkillGapHistory = asyncHandler(async (req, res) => {
  const history = await SkillGapReport.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, data: history });
});

export default { analyzeSkillGap, getSkillGapHistory };
