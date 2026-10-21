import mongoose from "mongoose";

/**
 * One question. Shared by InterviewSession and SkillAssessment now that
 * both features generate the same kind of typed, timed question set and
 * grade it the same way.
 *
 * `correctAnswer` and `keyPointsForGrading` are grading keys — never sent
 * to the client while status is "in-progress" (see each model's
 * toClientSafeJSON()), only used server-side when grading.
 */
export const questionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    type: { type: String, enum: ["mcq", "text", "coding"], required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    frequency: { type: String, enum: ["Rarely Asked", "Mostly Asked"], default: undefined },
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "" },
    keyPointsForGrading: { type: [String], default: [] },
    functionSignatureHint: { type: String, default: "" },
    timeLimitSeconds: { type: Number, required: true },

    // Filled in as the candidate answers.
    userAnswer: { type: String, default: "" },
    codeLanguage: { type: String, default: "" }, // only meaningful when type === "coding"
    answeredVia: {
      type: String,
      enum: ["voice", "text", "mcq", "code", "timeout", null],
      default: null,
    },
  },
  { _id: false }
);

export const skillLevelResultSchema = new mongoose.Schema(
  {
    skillTag: { type: String, required: true },
    level: { type: Number, min: 1, max: 10, required: true },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

export const perQuestionFeedbackSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    correct: { type: Boolean, required: true },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

/**
 * Strips grading keys from a plain object (already `.toObject()`'d) so a
 * not-yet-graded question set can be sent to the client without exposing
 * MCQ answers or the grading rubric.
 */
export function stripGradingKeys(questions) {
  return questions.map(({ correctAnswer, keyPointsForGrading, ...rest }) => rest);
}

export default { questionSchema, skillLevelResultSchema, perQuestionFeedbackSchema, stripGradingKeys };
