import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.js";
import { generateStructuredJSON } from "../services/groqClient.js";
import { questionSetSchema, gradingSchema } from "../services/aiSchemas.js";
import { getTimeLimitSeconds } from "../config/timeLimits.js";
import Resume from "../models/Resume.js";
import InterviewSession from "../models/InterviewSession.js";

const MIN_QUESTIONS = 12;
const MAX_QUESTIONS = 16;

const GENERATE_SYSTEM_INSTRUCTION = `You are a principal technical hiring lead at the target company, building a realistic,
high-yield mock interview inside Job Genius. Given a candidate's resume, target job description,
and company name, generate a balanced question set that accurately simulates this company's hiring loop.

Rules:
- Generate between ${MIN_QUESTIONS} and ${MAX_QUESTIONS} high-quality questions (aim for 12-14 questions).
- Include at least **2 coding** questions (or 1 if the role is non-technical) to ensure practical assessment.
- Mix question types:
  * "mcq" (around 5-7 questions): deep conceptual checks with exactly 4 distinct options and one unambiguously correct answer.
  * "text" (around 4-5 questions): architectural design, system trade‑offs, and behavioral scenarios requiring written explanation.
  * "coding" (around 2-3 questions for technical roles): concrete algorithm or data‑structure problems solvable in mainstream languages (JS, Python, Java, C++). Describe constraints, inputs, outputs, and provide a clear functionSignatureHint.
- Cover key categories via "topic": Core Fundamentals, System Architecture, Behavioral & Culture, and Company‑Specific engineering values.
- Tag difficulty realistically ("Easy", "Medium", "Hard") and frequency ("Mostly Asked", "Rarely Asked").
- For "mcq": correctAnswer must match one of the 4 options verbatim.
- For "text" and "coding": keyPointsForGrading must specify 2-4 concrete evaluation criteria.
- Ground every question deeply in the candidate's declared technologies and the target JD.

Respond only with JSON matching the provided schema.`;

const GRADE_SYSTEM_INSTRUCTION = `You are a senior interviewer at the target company, grading a completed mock
interview. For each question you're given its type, the grading key
(correctAnswer for mcq, or keyPointsForGrading for text/coding), and the
candidate's actual answer (plus, for coding questions, the language they
used and any captured output from running their code).

Rules:
- "mcq": correct = whether the candidate's answer matches the correct
  answer (allow minor formatting differences, not different meaning).
- "text" and "coding": judge correct/feedback by how well the answer
  demonstrates the keyPointsForGrading — for coding, also weigh whether the
  approach is sound and, if run output is provided, whether it looks right.
  Be fair but rigorous — no credit for vague, off-topic, or empty answers.
  An answer of "(no answer given)" or "(time expired — no answer)" is
  always incorrect with 0 credit, no exceptions.
- skillLevels: for each distinct topic that appeared, output an absolute
  1-10 proficiency level based on performance on THOSE questions.
- Be direct and specific — this needs to be genuinely useful feedback for
  interview prep, not generic encouragement.

Respond only with JSON matching the provided schema.`;

function attachTimeLimits(questions) {
  return questions.map((q) => ({ ...q, timeLimitSeconds: getTimeLimitSeconds(q.type, q.difficulty) }));
}

export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please attach your resume as a PDF file.", 400);
  }

  const companyName = (req.body.companyName || "").toString().trim();
  const jobDescription = (req.body.jobDescription || "").toString().trim();
  const jobRole = (req.body.jobRole || "").toString().trim();

  if (!companyName) throw new AppError("Company name is required.", 400);
  if (!jobDescription) throw new AppError("Job description is required.", 400);

  const { text: resumeText, pageCount } = await parseResumePdf(req.file.buffer);

  const prompt = `TARGET COMPANY: ${companyName}
TARGET ROLE: ${jobRole || "(not specified — infer from the job description)"}

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 6000)}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

Generate the mock interview question set.`;

  const result = await generateStructuredJSON({
    systemInstruction: GENERATE_SYSTEM_INSTRUCTION,
    prompt,
    schema: questionSetSchema,
  });

  const questions = attachTimeLimits(Array.isArray(result.questions) ? result.questions : []);
  if (questions.length === 0) {
    throw new AppError("The AI couldn't generate questions for these inputs. Please try again.", 502);
  }

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  const [, session] = await Promise.all([
    Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: resumeText,
      pageCount,
      sourceFeature: "mock-interviewer",
    }).catch((err) => console.error("[interview] failed to snapshot resume:", err.message)),
    InterviewSession.create({ userId: req.userId, companyName, jobRole, jobDescription, questions }),
  ]);

  res.status(200).json({ success: true, data: { sessionId: session._id, ...session.toClientSafeJSON() } });
});

/**
 * POST /api/interview/:sessionId/grade
 * body: { answers: [{ index, answer, codeLanguage?, runOutput? }] }
 */
export const gradeInterview = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new AppError("`answers` must be a non-empty array.", 400);
  }

  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.userId });
  if (!session) throw new AppError("Interview session not found.", 404);

  if (session.status === "graded") {
    return res.status(200).json({ success: true, data: session, alreadyGraded: true });
  }
  if (session.status === "failed-proctoring") {
    return res.status(200).json({ success: true, data: session, alreadyFailed: true });
  }

  for (const { index, answer, codeLanguage } of answers) {
    if (session.questions[index]) {
      session.questions[index].userAnswer = (answer || "").toString().slice(0, 5000);
      if (codeLanguage) session.questions[index].codeLanguage = codeLanguage.toString().slice(0, 30);
    }
  }

  const gradingPayload = session.questions.map((q, index) => {
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

Grade this interview now.`;

  const result = await generateStructuredJSON({
    systemInstruction: GRADE_SYSTEM_INSTRUCTION,
    prompt,
    schema: gradingSchema,
  });

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  session.status = "graded";
  session.overallScore = clampScore(result.overallScore);
  session.overallFeedback = result.overallFeedback || "";
  session.skillLevels = (result.skillLevels || []).map((s) => ({
    skillTag: s.skillTag,
    level: Math.max(1, Math.min(10, Math.round(Number(s.level) || 1))),
    feedback: s.feedback || "",
  }));
  session.perQuestionFeedback = result.perQuestionFeedback || [];
  session.completedAt = new Date();
  session.gradedAt = new Date();

  await session.save();
  res.status(200).json({ success: true, data: session });
});

/**
 * POST /api/interview/:sessionId/fail
 * body: { reason: "face-not-detected" | "tab-switch", answers?: [...] }
 * Proctoring violation — ends the session immediately with a score of 0.
 * No AI call is made (nothing to grade), so this never touches quota.
 */
export const failInterview = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const reason = (req.body.reason || "").toString();
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

  if (!["face-not-detected", "tab-switch"].includes(reason)) {
    throw new AppError('`reason` must be "face-not-detected" or "tab-switch".', 400);
  }

  const session = await InterviewSession.findOne({ _id: sessionId, userId: req.userId });
  if (!session) throw new AppError("Interview session not found.", 404);

  if (session.status !== "graded" && session.status !== "failed-proctoring") {
    for (const { index, answer, codeLanguage } of answers) {
      if (session.questions[index]) {
        session.questions[index].userAnswer = (answer || "").toString().slice(0, 5000);
        if (codeLanguage) session.questions[index].codeLanguage = codeLanguage.toString().slice(0, 30);
      }
    }
    session.status = "failed-proctoring";
    session.proctoringFailureReason = reason;
    session.overallScore = 0;
    session.overallFeedback =
      reason === "face-not-detected"
        ? "This session was automatically failed because your face was not visible to the camera for too long."
        : "This session was automatically failed because you switched away from this tab during the test.";
    session.completedAt = new Date();
  }

  await session.save();
  res.status(200).json({ success: true, data: session });
});

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const getInterviewHistory = asyncHandler(async (req, res) => {
  const history = await InterviewSession.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, data: history });
});

export default { generateInterviewQuestions, gradeInterview, failInterview, getInterviewHistory };
