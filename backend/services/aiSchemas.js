/**
 * Groq Structured Outputs schema definitions (`strict: true` mode).
 *
 * Kept separate from the controllers so the "shape of the data" is easy to
 * scan independently of "how we prompt for it". Each export is a
 * `{ name, schema }` pair — `name` is the schema identifier Groq's API
 * requires, `schema` is the actual JSON Schema — consumed directly by
 * services/groqClient.js's generateStructuredJSON().
 *
 * Strict mode's hard requirements (see https://console.groq.com/docs/structured-outputs)
 * shape every schema below:
 *   1. Every property must appear in `required` — there are no optional
 *      keys. A field that's only sometimes applicable (e.g. "options" on
 *      an mcq question but not a text question) is still required, but
 *      its type allows null — see questionSetSchema's `anyOf` fields.
 *   2. Every object must set `additionalProperties: false`.
 * In exchange, the response is GUARANTEED to match the schema exactly
 * (constrained decoding) — controllers never need to defensively handle
 * a missing or malformed field from the AI.
 */

// ── AI Job Matcher — step 2 (structuring a grounded research pass) ─────
// Step 1 uses groq/compound's built-in web search (no schema — tool use
// and Structured Outputs can't combine) to find real, current openings;
// step 2 takes that raw grounded text and structures it into this shape
// WITHOUT inventing anything not already present in step 1's output. See
// controllers/jobMatcherController.js.
export const jobMatchSchema = {
  name: "job_match_result",
  schema: {
    type: "object",
    properties: {
      extractedSkills: {
        type: "array",
        items: { type: "string" },
        description: "5-12 concrete skills/technologies pulled from the resume.",
      },
      candidateSummary: {
        type: "string",
        description: "One or two sentence summary of the candidate's profile.",
      },
      candidateExperienceLevel: {
        type: "string",
        description:
          "e.g. 'Entry-level', 'Mid-level (2-4 yrs)', 'Senior (5+ yrs)' — based ONLY on full-time/professional roles, never counting internships as professional experience.",
      },
      jobs: {
        type: "array",
        items: {
          type: "object",
          properties: {
            jobRole: { type: "string" },
            companyName: { type: "string" },
            location: { type: "string", description: "Use 'Remote' or 'Not specified' if unknown." },
            description: { type: "string", description: "2-3 sentence brief of the role and why it fits." },
            matchScore: { type: "integer", description: "0-100 fit score against the candidate's resume." },
            keySkillsMatched: { type: "array", items: { type: "string" }, description: "Use [] if none stand out." },
            applyLink: {
              type: "string",
              description: "The exact URL found during research. Never invented — copied verbatim from the source material.",
            },
            linkType: {
              type: "string",
              enum: ["direct_posting", "careers_page"],
              description: "'direct_posting' if the URL is the specific job listing; 'careers_page' if it's the company's filtered careers/jobs search page because no single posting URL was confidently found.",
            },
          },
          required: ["jobRole", "companyName", "location", "description", "matchScore", "keySkillsMatched", "applyLink", "linkType"],
          additionalProperties: false,
        },
      },
    },
    required: ["extractedSkills", "candidateSummary", "candidateExperienceLevel", "jobs"],
    additionalProperties: false,
  },
};

// ── Mock Interviewer & Skill Assessment — question generation ──────────
// Shared shape: both features generate a mix of mcq / text / coding
// questions. `frequency` is only meaningful for interview questions (the
// assessment prompt tells the model to always set it null); every
// conditionally-relevant field (options/correctAnswer for mcq,
// keyPointsForGrading for text/coding, functionSignatureHint for coding)
// is still a required key but nullable, per strict mode's rules.
export const questionSetSchema = {
  name: "question_set",
  schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topic: { type: "string", description: "The specific skill/category this question probes." },
            type: { type: "string", enum: ["mcq", "text", "coding"] },
            difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
            frequency: {
              anyOf: [{ type: "string", enum: ["Rarely Asked", "Mostly Asked"] }, { type: "null" }],
              description: "Interview questions only — how commonly this comes up for this role. Null otherwise.",
            },
            questionText: {
              type: "string",
              description: "For 'coding' questions, include example input/output and constraints here — the problem must be solvable in any mainstream language, never assume a specific language's syntax.",
            },
            options: {
              anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
              description: "Exactly 4 options — required (non-null) when type is 'mcq', null otherwise.",
            },
            correctAnswer: {
              anyOf: [{ type: "string" }, { type: "null" }],
              description: "Required (non-null) when type is 'mcq' — must exactly match one of the options. Null otherwise.",
            },
            keyPointsForGrading: {
              anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
              description: "2-4 concise concepts a strong answer should cover — required (non-null) when type is 'text' or 'coding'. Null otherwise.",
            },
            functionSignatureHint: {
              anyOf: [{ type: "string" }, { type: "null" }],
              description: "Coding questions only, e.g. 'twoSum(nums: number[], target: number): number[]'. Null otherwise.",
            },
          },
          required: ["topic", "type", "difficulty", "frequency", "questionText", "options", "correctAnswer", "keyPointsForGrading", "functionSignatureHint"],
          additionalProperties: false,
        },
      },
    },
    required: ["questions"],
    additionalProperties: false,
  },
};

// ── Mock Interviewer & Skill Assessment — grading ───────────────────────
// Also shared: once both features have typed, timed questions with
// objectively-checkable (mcq) and AI-judged (text/coding) answers, grading
// them is the same problem. `skillTag` is used verbatim by
// dashboardController.js's cross-feature skill aggregation.
export const gradingSchema = {
  name: "grading_result",
  schema: {
    type: "object",
    properties: {
      overallScore: { type: "integer", description: "0-100." },
      overallFeedback: { type: "string", description: "2-4 sentences, direct and constructive." },
      skillLevels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skillTag: { type: "string" },
            level: { type: "integer", description: "Absolute 1-10 proficiency level after grading." },
            feedback: { type: "string" },
          },
          required: ["skillTag", "level", "feedback"],
          additionalProperties: false,
        },
      },
      perQuestionFeedback: {
        type: "array",
        items: {
          type: "object",
          properties: {
            questionIndex: { type: "integer" },
            correct: { type: "boolean" },
            feedback: { type: "string", description: "One or two sentences, specific to this answer." },
          },
          required: ["questionIndex", "correct", "feedback"],
          additionalProperties: false,
        },
      },
    },
    required: ["overallScore", "overallFeedback", "skillLevels", "perQuestionFeedback"],
    additionalProperties: false,
  },
};

// ── Job Skill Gap Analysis & Roadmap ─────────────────────────────────────
export const skillGapSchema = {
  name: "skill_gap_result",
  schema: {
    type: "object",
    properties: {
      atsScore: { type: "integer", description: "0-100 estimate of how well the resume would pass an ATS keyword screen for this JD." },
      acceptanceChance: { type: "integer", description: "0-100 realistic estimate of the candidate's chance of being accepted for this role." },
      summary: { type: "string", description: "2-4 sentence honest overview of the gap." },
      skillsComparison: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skill: { type: "string" },
            requiredLevel: { type: "integer", description: "1-10 level the role demands." },
            currentLevel: { type: "integer", description: "1-10 level evidenced by the resume." },
          },
          required: ["skill", "requiredLevel", "currentLevel"],
          additionalProperties: false,
        },
        description: "6-10 of the most relevant skills for this JD.",
      },
      roadmap: {
        type: "array",
        items: {
          type: "object",
          properties: {
            phaseTitle: { type: "string" },
            timeframe: { type: "string" },
            focusSkills: { type: "array", items: { type: "string" }, description: "Use [] if none specific to this phase." },
            tasks: { type: "array", items: { type: "string" } },
          },
          required: ["phaseTitle", "timeframe", "focusSkills", "tasks"],
          additionalProperties: false,
        },
        description: "Phases that together fit inside the candidate's stated time-left window.",
      },
    },
    required: ["atsScore", "acceptanceChance", "summary", "skillsComparison", "roadmap"],
    additionalProperties: false,
  },
};

export default {
  jobMatchSchema,
  questionSetSchema,
  gradingSchema,
  skillGapSchema,
};
