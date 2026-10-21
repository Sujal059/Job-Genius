import mongoose from "mongoose";

const skillComparisonSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    requiredLevel: { type: Number, min: 1, max: 10, required: true },
    currentLevel: { type: Number, min: 1, max: 10, required: true },
  },
  { _id: false }
);

const roadmapPhaseSchema = new mongoose.Schema(
  {
    phaseTitle: { type: String, required: true },
    timeframe: { type: String, required: true },
    focusSkills: { type: [String], default: [] },
    tasks: { type: [String], default: [] },
  },
  { _id: false }
);

const skillGapReportSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    jobDescription: { type: String, required: true },
    timeLeft: { type: String, required: true },
    atsScore: { type: Number, min: 0, max: 100, required: true },
    acceptanceChance: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, default: "" },
    skillsComparison: { type: [skillComparisonSchema], default: [] },
    roadmap: { type: [roadmapPhaseSchema], default: [] },
  },
  { timestamps: true }
);

skillGapReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("SkillGapReport", skillGapReportSchema);
