import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import JobMatch from "../models/JobMatch.js";
import InterviewSession from "../models/InterviewSession.js";
import SkillGapReport from "../models/SkillGapReport.js";
import SkillAssessment from "../models/SkillAssessment.js";
import { PLAN_LIMITS } from "../config/plans.js";

const RECENT_LIMIT = 8;

/**
 * getDashboard
 * ------------
 * Returns complete career telemetry for the logged-in user.
 * STRICT ISOLATION: Every single query is strictly scoped to req.userId.
 * No user can ever see another candidate's resumes, matches, or test results.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.userId ? String(req.userId) : null;
  if (!userId) {
    throw new AppError("Authentication required.", 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Account not found. Please log in again.", 401);
  }

  const [
    jobMatchCount,
    interviewCount,
    gapReportCount,
    gradedAssessmentCount,
    appliedJobCount,
    latestResume,
    recentJobMatches,
    recentInterviews,
    recentGapReports,
    recentAssessments,
    jobsMatchedTotalAgg,
    avgInterviewAgg,
    avgAtsAgg,
  ] = await Promise.all([
    JobMatch.countDocuments({ userId }),
    InterviewSession.countDocuments({ userId }),
    SkillGapReport.countDocuments({ userId }),
    SkillAssessment.countDocuments({ userId, status: "graded" }),
    JobMatch.aggregate([
      { $match: { userId } },
      { $unwind: "$jobs" },
      { $match: { "jobs.applied": true } },
      { $count: "total" },
    ]).then((r) => r[0]?.total || 0),
    Resume.findOne({ userId }).sort({ createdAt: -1 }).select("fileName createdAt pageCount").lean(),
    JobMatch.find({ userId })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("jobs comment candidateExperienceLevel createdAt")
      .lean(),
    InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("companyName jobRole status overallScore skillLevels createdAt gradedAt")
      .lean(),
    SkillGapReport.find({ userId })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("companyName jobRole atsScore acceptanceChance skillsComparison createdAt")
      .lean(),
    SkillAssessment.find({ userId, status: { $in: ["graded", "failed-proctoring"] } })
      .sort({ gradedAt: -1 })
      .limit(RECENT_LIMIT)
      .select("overallScore skillLevels gradedAt status")
      .lean(),
    JobMatch.aggregate([
      { $match: { userId } },
      { $project: { jobCount: { $size: { $ifNull: ["$jobs", []] } } } },
      { $group: { _id: null, total: { $sum: "$jobCount" } } },
    ]).then((r) => r[0]?.total || 0),
    InterviewSession.aggregate([
      { $match: { userId, status: "graded", overallScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ]).then((r) => (r[0]?.avgScore ? Math.round(r[0].avgScore) : null)),
    SkillGapReport.aggregate([
      { $match: { userId, atsScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: "$atsScore" } } },
    ]).then((r) => (r[0]?.avgScore ? Math.round(r[0].avgScore) : null)),
  ]);

  const skills = buildUnifiedSkillProfile({ recentGapReports, recentAssessments, recentInterviews });
  const recentActivity = buildRecentActivity({
    recentJobMatches,
    recentInterviews,
    recentGapReports,
    recentAssessments,
  });

  const planLimit = PLAN_LIMITS[user.subscriptionPlan];
  const quotaUsed = user.usage?.count || 0;
  const quotaRemaining = planLimit === null ? null : Math.max(0, planLimit - quotaUsed);

  const stats = {
    jobsMatched: jobsMatchedTotalAgg,
    jobsApplied: appliedJobCount,
    jobMatchRuns: jobMatchCount,
    interviewSessions: interviewCount,
    avgInterviewScore: avgInterviewAgg,
    skillGapReports: gapReportCount,
    avgAtsScore: avgAtsAgg,
    assessmentsCompleted: gradedAssessmentCount,
  };

  const userProfile = {
    id: user._id,
    name: user.name,
    email: user.email,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus || "none",
    usage: {
      count: quotaUsed,
      periodStart: user.usage?.periodStart || user.createdAt,
      limit: planLimit,
      remaining: quotaRemaining,
    },
  };

  res.status(200).json({
    success: true,
    data: {
      user: userProfile,
      hasActivity: Boolean(jobMatchCount || interviewCount || gapReportCount || gradedAssessmentCount),
      latestResume,
      stats,
      skills,
      recentActivity,
    },
  });
});

function buildUnifiedSkillProfile({ recentGapReports, recentAssessments, recentInterviews }) {
  /** @type {{skill:string, level:number, source:string, date:Date, tier:string}[]} */
  const points = [];

  for (const report of recentGapReports) {
    for (const s of report.skillsComparison || []) {
      const level = Math.max(1, Math.min(10, Math.round(Number(s.currentLevel) || 1)));
      points.push({
        skill: s.skill,
        level,
        source: "Skill Gap Analysis",
        date: report.createdAt,
        tier: getTier(level),
      });
    }
  }

  for (const assessment of recentAssessments) {
    if (assessment.status !== "graded") continue;
    for (const s of assessment.skillLevels || []) {
      const level = Math.max(1, Math.min(10, Math.round(Number(s.level) || 1)));
      points.push({
        skill: s.skillTag,
        level,
        source: "Skill Assessment",
        date: assessment.gradedAt,
        tier: getTier(level),
      });
    }
  }

  for (const interview of recentInterviews) {
    if (interview.status !== "graded") continue;
    for (const s of interview.skillLevels || []) {
      const level = Math.max(1, Math.min(10, Math.round(Number(s.level) || 1)));
      points.push({
        skill: s.skillTag,
        level,
        source: "Mock Interview",
        date: interview.gradedAt,
        tier: getTier(level),
      });
    }
  }

  // Most recent data point per normalized skill name wins
  points.sort((a, b) => new Date(b.date) - new Date(a.date));

  const seen = new Map();
  for (const point of points) {
    const key = point.skill.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, point);
  }

  return [...seen.values()].sort((a, b) => b.level - a.level).slice(0, 16);
}

function getTier(level) {
  if (level >= 9) return "Expert";
  if (level >= 7) return "Advanced";
  if (level >= 5) return "Intermediate";
  return "Foundational";
}

function buildRecentActivity({ recentJobMatches, recentInterviews, recentGapReports, recentAssessments }) {
  const items = [
    ...recentJobMatches.map((r) => ({
      id: r._id,
      type: "job-matcher",
      badge: "Job Matcher",
      title: `Matched ${r.jobs?.length || 0} real tech job openings`,
      subtitle: r.candidateExperienceLevel ? `Calibrated for ${r.candidateExperienceLevel}` : "Resume AI search",
      date: r.createdAt,
      link: "/job-matcher",
      metric: `${r.jobs?.length || 0} jobs`,
      tone: "cyan",
    })),
    ...recentInterviews.map((r) => ({
      id: r._id,
      type: "mock-interviewer",
      badge: "Mock Interview",
      title:
        r.status === "failed-proctoring"
          ? `Interview for ${r.jobRole || "Role"} at ${r.companyName || "Target Co"} (Proctoring Flag)`
          : r.status === "graded"
            ? `Mock Interview for ${r.jobRole || "Role"} at ${r.companyName || "Target Co"}`
            : `Interview in progress for ${r.companyName || "Target Co"}`,
      subtitle: r.companyName ? `Company: ${r.companyName}` : "Technical Loop",
      date: r.gradedAt || r.createdAt,
      link: "/mock-interviewer",
      metric: r.status === "graded" ? `${r.overallScore}% score` : r.status === "failed-proctoring" ? "Flagged" : "Active",
      tone: r.status === "graded" && r.overallScore >= 70 ? "emerald" : r.status === "failed-proctoring" ? "rose" : "indigo",
    })),
    ...recentGapReports.map((r) => ({
      id: r._id,
      type: "skill-gap",
      badge: "ATS Gap Analysis",
      title: `ATS diagnostic for ${r.jobRole || "Target Role"} at ${r.companyName || "Company"}`,
      subtitle: `${r.skillsComparison?.length || 0} key competencies mapped`,
      date: r.createdAt,
      link: "/skill-gap",
      metric: `${r.atsScore}% ATS`,
      tone: r.atsScore >= 75 ? "emerald" : "amber",
    })),
    ...recentAssessments.map((r) => ({
      id: r._id,
      type: "skill-assessment",
      badge: "Skill Assessment",
      title:
        r.status === "failed-proctoring"
          ? "Proctored Skill Verification (Session Flagged)"
          : `Deep Technical Assessment Benchmark (${r.overallScore}%)`,
      subtitle: `${r.skillLevels?.length || 0} topics verified on 1-10 scale`,
      date: r.gradedAt || r.createdAt,
      link: "/skill-assessment",
      metric: r.status === "graded" ? `${r.overallScore}% score` : "Flagged",
      tone: r.status === "graded" && r.overallScore >= 70 ? "emerald" : "purple",
    })),
  ];

  return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
}

export default { getDashboard };
