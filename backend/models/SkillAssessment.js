import mongoose from "mongoose";
import { questionSchema, skillLevelResultSchema, perQuestionFeedbackSchema, stripGradingKeys } from "./shared/testSubSchemas.js";

const skillAssessmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    questions: { type: [questionSchema], default: [] },

    status: {
      type: String,
      enum: ["generated", "graded", "failed-proctoring"],
      default: "generated",
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

    gradedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

skillAssessmentSchema.index({ userId: 1, createdAt: -1 });

/** Strips grading keys before a not-yet-graded assessment is sent to the client. */
skillAssessmentSchema.methods.toClientSafeJSON = function toClientSafeJSON() {
  const obj = this.toObject();
  obj.questions = stripGradingKeys(obj.questions);
  return obj;
};

export default mongoose.model("SkillAssessment", skillAssessmentSchema);
