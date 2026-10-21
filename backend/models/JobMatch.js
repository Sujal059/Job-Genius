import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobRole: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, default: "Remote / Not specified" },
    description: { type: String, required: true },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    keySkillsMatched: { type: [String], default: [] },
    applyLink: { type: String, required: true },
    linkType: { type: String, enum: ["direct_posting", "careers_page"], default: "careers_page" },
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date, default: null },
  },
  { _id: false }
);

const jobMatchSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    comment: { type: String, default: "" },
    candidateSummary: { type: String, default: "" },
    candidateExperienceLevel: { type: String, default: "" },
    extractedSkills: { type: [String], default: [] },
    jobs: { type: [jobSchema], default: [] },
  },
  { timestamps: true }
);

jobMatchSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("JobMatch", jobMatchSchema);
