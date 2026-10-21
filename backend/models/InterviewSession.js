import mongoose from "mongoose";
import { questionSchema, skillLevelResultSchema, perQuestionFeedbackSchema, stripGradingKeys } from "./shared/testSubSchemas.js";

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    companyName: { type: String, required: true },
    jobRole: { type: String, default: "" },
    jobDescription: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },

    status: {
      type: String,
      enum: ["in-progress", "graded", "failed-proctoring"],
      default: "in-progress",
    },
    proctoringFailureReason: {
      type: String,
      enum: ["face-not-detected", "tab-switch", null],
      default: null,
    },

    overallScore: { type: Number, min: 0, max: 100, default: null },
    overallFeedback: { type: String, default: "" },
    skillLevels: { type: [skillLevelResultSchema], default: [] },
    perQuestionFeedback: { type: [perQuestionFeedbackSchema], default: [] },

    completedAt: { type: Date, default: null },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

/** Strips grading keys before an in-progress session is sent to the client. */
interviewSessionSchema.methods.toClientSafeJSON = function toClientSafeJSON() {
  const obj = this.toObject();
  obj.questions = stripGradingKeys(obj.questions);
  return obj;
};

export default mongoose.model("InterviewSession", interviewSessionSchema);
