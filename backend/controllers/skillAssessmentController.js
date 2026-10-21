import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.js";
import { generateStructuredJSON } from "../services/groqClient.js";
import { questionSetSchema, gradingSchema } from "../services/aiSchemas.js";
import { getTimeLimitSeconds } from "../config/timeLimits.js";
import Resume from "../models/Resume.js";
import SkillAssessment from "../models/SkillAssessment.js";

const MIN_QUESTIONS = 12;
const MAX_QUESTIONS = 16;

const GENERATE_SYSTEM_INSTRUCTION = `You are a rigorous technical competency assessor inside Job Genius.
Given a candidate's resume, design a targeted, resume-grounded skill verification test that
probes whether the candidate possesses the genuine technical proficiency they claim.

Rules:
- Produce between ${MIN_QUESTIONS} and ${MAX_QUESTIONS} high-impact questions (aim for 12-14 questions).
- Include at least **2 coding** questions (or 1 if the role is non-technical) to ensure practical assessment.
- Mix question types:
  * "mcq" (around 5-7 questions): architectural concept checks, concurrency, performance tradeoffs, and runtime internals with exactly 4 options and one clearly correct answer.
  * "text" (around 4-5 questions): short technical explanations demonstrating concrete understanding of trade-offs, debugging, and systems.
  * "coding" (around 2-3 questions): algorithmic problems solvable in mainstream languages (JS, Python, Java, C++) with input/output examples, constraints, and hints.
- For "mcq": correctAnswer must match one of the 4 options exactly.
- For "text" and "coding": keyPointsForGrading must specify 2-4 concise rubric points.
- Ground every question directly in the specific skills claimed on the resume.

Respond only with JSON matching the provided schema.`;

const GRADE_SYSTEM_INSTRUCTION = `You are a rigorous technical assessor inside a product called Job Genius,
grading a completed skill assessment. For each question you're given the
question, its type, the grading key (correctAnswer for mcq, or
keyPointsForGrading for text/coding), and the candidate's actual answer
(plus, for coding questions, the language they used and any captured output
from running their code).

Rules:
- "mcq": correct = whether the candidate's answer matches the correct
  answer (allow minor formatting differences, not different meaning).
- "text" and "coding": judge correct/feedback by how many of the
  keyPointsForGrading the answer actually demonstrates — for coding, also
  weigh whether the approach is sound and, if run output is provided,
  whether it looks correct. Be fair but rigorous — no credit for vague,
  off-topic, or empty answers. An answer of "(no answer given)" or
  "(time expired — no answer)" is always incorrect with 0 credit.
- skillLevels: for each distinct topic that appeared, output an absolute
  1-10 proficiency level based on performance on THOSE questions
  specifically (not the resume in general).
- Be direct and specific in feedback — this is meant to be genuinely
  useful, not falsely encouraging.

Respond only with JSON matching the provided schema.`;

function attachTimeLimits(questions) {
  return questions.map((q) => ({ ...q, timeLimitSeconds: getTimeLimitSeconds(q.type, q.difficulty) }));
}

export const generateAssessment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please attach your resume as a PDF file.", 400);
  }

  const { text: resumeText, pageCount } = await parseResumePdf(req.file.buffer);

  const prompt = `CANDIDATE RESUME:
"""
${resumeText}
"""

Design the deep skill assessment for this candidate.`;

  const result = await generateStructuredJSON({
    systemInstruction: GENERATE_SYSTEM_INSTRUCTION,
    prompt,
    schema: questionSetSchema,
  });

  const questions = attachTimeLimits(Array.isArray(result.questions) ? result.questions : []);
  if (questions.length === 0) {
    throw new AppError("The AI couldn't generate an assessment from this resume. Please try again.", 502);
  }

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  const [, assessment] = await Promise.all([
    Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: resumeText,
      pageCount,
      sourceFeature: "skill-assessment",
    }).catch((err) => console.error("[skill-assessment] failed to snapshot resume:", err.message)),
    SkillAssessment.create({ userId: req.userId, questions }),
  ]);

  res.status(200).json({
    success: true,
    data: { assessmentId: assessment._id, ...assessment.toClientSafeJSON() },
  });
});

/**
 * POST /api/skill-assessment/:assessmentId/submit
 * body: { answers: [{ index, answer, codeLanguage?, runOutput? }] }
 */
export const submitAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError("`answers` must be a non-empty array.", 400);
  }

  const assessment = await SkillAssessment.findOne({ _id: assessmentId, userId: req.userId });
  if (!assessment) throw new AppError("Assessment not found.", 404);

  if (assessment.status === "graded") {
    return res.status(200).json({ success: true, data: assessment, alreadyGraded: true });
  }
  if (assessment.status === "failed-proctoring") {
    return res.status(200).json({ success: true, data: assessment, alreadyFailed: true });
  }

  for (const { index, answer, codeLanguage } of answers) {
    if (assessment.questions[index]) {
      assessment.questions[index].userAnswer = (answer || "").toString().slice(0, 3000);
      if (codeLanguage) assessment.questions[index].codeLanguage = codeLanguage.toString().slice(0, 30);
    }
  }

  const gradingPayload = assessment.questions.map((q, index) => {
    const submitted = answers.find((a) => a.index === index);
    return {
      index,
      topic: q.topic,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      keyPointsForGrading: q.keyPointsForGrading,
      candidateAnswer: q.userAnswer || "(no answer given)",
      codeLanguage: q.type === "coding" ? q.codeLanguage : undefined,
      runOutput: q.type === "coding" ? submitted?.runOutput?.slice(0, 1000) : undefined,
    };
  });

  const prompt = `QUESTIONS, GRADING KEYS, AND CANDIDATE ANSWERS:
${JSON.stringify(gradingPayload, null, 2)}

Grade this assessment now.`;

  const result = await generateStructuredJSON({
    systemInstruction: GRADE_SYSTEM_INSTRUCTION,
    prompt,
    schema: gradingSchema,
  });

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  assessment.status = "graded";
  assessment.overallScore = clampScore(result.overallScore);
  assessment.overallFeedback = result.overallFeedback || "";
  assessment.skillLevels = (result.skillLevels || []).map((s) => ({
    skillTag: s.skillTag,
    level: Math.max(1, Math.min(10, Math.round(Number(s.level) || 1))),
    feedback: s.feedback || "",
  }));
  assessment.perQuestionFeedback = result.perQuestionFeedback || [];
  assessment.gradedAt = new Date();

  await assessment.save();
  res.status(200).json({ success: true, data: assessment });
});

/**
 * POST /api/skill-assessment/:assessmentId/fail
 * body: { reason: "face-not-detected" | "tab-switch", answers?: [...] }
 * Proctoring violation — ends the assessment immediately with a score of
 * 0. No AI call is made, so this never touches quota.
 */
export const failAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const reason = (req.body.reason || "").toString();
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

  if (!["face-not-detected", "tab-switch"].includes(reason)) {
    throw new AppError('`reason` must be "face-not-detected" or "tab-switch".', 400);
  }

  const assessment = await SkillAssessment.findOne({ _id: assessmentId, userId: req.userId });
  if (!assessment) throw new AppError("Assessment not found.", 404);

  if (assessment.status !== "graded" && assessment.status !== "failed-proctoring") {
    for (const { index, answer, codeLanguage } of answers) {
      if (assessment.questions[index]) {
        assessment.questions[index].userAnswer = (answer || "").toString().slice(0, 3000);
        if (codeLanguage) assessment.questions[index].codeLanguage = codeLanguage.toString().slice(0, 30);
      }
    }
    assessment.status = "failed-proctoring";
    assessment.proctoringFailureReason = reason;
    assessment.overallScore = 0;
    assessment.overallFeedback =
      reason === "face-not-detected"
        ? "This assessment was automatically failed because your face was not visible to the camera for too long."
        : "This assessment was automatically failed because you switched away from this tab during the test.";
    assessment.gradedAt = new Date();
  }

  await assessment.save();
  res.status(200).json({ success: true, data: assessment });
});

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const getAssessmentHistory = asyncHandler(async (req, res) => {
  const history = await SkillAssessment.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, data: history });
});

export default { generateAssessment, submitAssessment, failAssessment, getAssessmentHistory };
