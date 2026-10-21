import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { parseResumePdf } from "../services/resumeParser.js";
import { generateStructuredJSON } from "../services/groqClient.js";
import { jobMatchSchema } from "../services/aiSchemas.js";
import Resume from "../models/Resume.js";
import JobMatch from "../models/JobMatch.js";

const MIN_JOBS = 12;

const JOB_MATCH_SYSTEM_INSTRUCTION = `You are an elite AI technical recruiter and career intelligence engine inside Job Genius.
Given a candidate's resume and optional career preferences, identify at least ${MIN_JOBS} real, high-match job openings at companies actively hiring for these exact technologies and seniority level.

Rules:
1. Seniority judgment: evaluate the candidate's true professional experience (excluding internships and student roles).
   Accurately assign experience level: e.g. "Entry-level (0-2 yrs)", "Mid-level (2-5 yrs)", "Senior (5+ yrs)", "Staff / Principal (8+ yrs)".
2. Companies & Roles: Recommend real tech companies (e.g. Stripe, Datadog, Vercel, Shopify, Airbnb, Figma, Google, Amazon, Coinbase, Uber, high-growth startups, and remote-first tech organizations) hiring for roles fitting the candidate's demonstrated stack.
3. Openings & Apply links:
   For every job, provide an authentic, working career portal URL or direct targeted application link:
   - Official company careers pages (e.g. "https://stripe.com/jobs", "https://boards.greenhouse.io/stripe", "https://jobs.lever.co/...")
   - Direct targeted LinkedIn Jobs live search URLs (e.g. "https://www.linkedin.com/jobs/search/?keywords=Senior+Frontend+Engineer+Stripe")
   - Targeted Indeed or Wellfound search links (e.g. "https://wellfound.com/jobs?role=Frontend+Engineer")
   - Set linkType to "direct_posting" if specific to the role/board, or "careers_page" if linking to company's filtered careers portal.
   - Never output empty or invalid URLs.
4. Match Score: Compute a realistic 0-100 fit score reflecting how closely the candidate's tech stack, years of experience, and past accomplishments match the role requirements.
5. Key Skills Matched: Pull 3-6 concrete skills from the resume that directly align with the job's core requirements.
6. Description: 2-3 concise, high-value sentences detailing the role's mission and why this candidate is a strong fit.
7. Candidate Summary: 1-2 sentence executive summary of the candidate's core profile and standout technical strengths.

Respond only with JSON matching the provided schema.`;

export const matchJobs = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please attach your resume as a PDF file.", 400);
  }

  const comment = (req.body.comment || "").toString().trim().slice(0, 1000);
  const { text: resumeText, pageCount } = await parseResumePdf(req.file.buffer);
  const today = new Date().toDateString();

  const prompt = `Today's date: ${today}

CANDIDATE RESUME:
"""
${resumeText}
"""

CANDIDATE PREFERENCES / TARGET ROLES:
"""
${comment || "Match roles that best fit the candidate's demonstrated technical skills, tools, and seniority level."}
"""

Analyze the candidate's profile and recommend at least ${MIN_JOBS} matching job openings at real companies actively hiring for these skills.`;

  const result = await generateStructuredJSON({
    systemInstruction: JOB_MATCH_SYSTEM_INSTRUCTION,
    prompt,
    schema: jobMatchSchema,
    timeoutMs: 60000,
  });

  const jobs = Array.isArray(result.jobs) ? result.jobs : [];
  if (jobs.length === 0) {
    throw new AppError(
      "The AI wasn't able to generate structured job matches for this resume. Please ensure the resume contains clear work history or technical skills and try again.",
      502
    );
  }

  // Record quota usage only after successful AI response
  await req.recordQuotaSuccess?.();

  const [, saved] = await Promise.all([
    Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText: resumeText,
      pageCount,
      extractedSkills: result.extractedSkills || [],
      sourceFeature: "job-matcher",
    }).catch((err) => console.error("[job-matcher] failed to snapshot resume:", err.message)),
    JobMatch.create({
      userId: req.userId,
      comment,
      candidateSummary: result.candidateSummary || "",
      candidateExperienceLevel: result.candidateExperienceLevel || "",
      extractedSkills: result.extractedSkills || [],
      jobs,
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      id: saved._id,
      candidateSummary: result.candidateSummary || "",
      candidateExperienceLevel: result.candidateExperienceLevel || "",
      extractedSkills: result.extractedSkills || [],
      jobs: saved.jobs,
    },
  });
});

/**
 * PATCH /api/job-matcher/:jobMatchId/jobs/:jobIndex/apply
 * Toggles whether the candidate has marked a specific job as applied
 */
export const setJobApplied = asyncHandler(async (req, res) => {
  const { jobMatchId, jobIndex } = req.params;
  const applied = Boolean(req.body.applied);

  const jobMatch = await JobMatch.findOne({ _id: jobMatchId, userId: req.userId });
  if (!jobMatch) throw new AppError("Job search not found.", 404);

  const index = Number(jobIndex);
  if (!jobMatch.jobs[index]) throw new AppError("Job not found in this search.", 404);

  jobMatch.jobs[index].applied = applied;
  jobMatch.jobs[index].appliedAt = applied ? new Date() : null;
  await jobMatch.save();

  res.status(200).json({ success: true, data: jobMatch.jobs[index] });
});

/**
 * GET /api/job-matcher/history
 */
export const getJobMatchHistory = asyncHandler(async (req, res) => {
  const history = await JobMatch.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: history });
});

export default { matchJobs, setJobApplied, getJobMatchHistory };
