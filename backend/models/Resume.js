import mongoose from "mongoose";

/**
 * We snapshot every resume a user uploads (across any of the 4 features).
 * This is what lets the Dashboard show "your resume on file" and gives us
 * a record of the skills the AI has extracted over time. It is not read
 * back mid-request — every feature parses the freshly-uploaded PDF for its
 * own call — this is purely a historical/dashboard record.
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    pageCount: { type: Number, default: 1 },
    extractedSkills: { type: [String], default: [] },
    sourceFeature: {
      type: String,
      enum: ["job-matcher", "mock-interviewer", "skill-gap", "skill-assessment"],
      required: true,
    },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Resume", resumeSchema);
