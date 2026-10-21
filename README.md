# Job Genius

An AI career copilot built on the MERN stack (MongoDB, Express, React, Node) with Groq doing
the reasoning, real email/password accounts, subscription tiers that gate AI usage by
requests-per-month, AI-proctored timed tests, and comprehensive history tracking. Four tools, one resume:

1. **AI Job Matcher** — live web search for real, currently open tech roles matching your exact stack, with genuine apply links, match fit scores, and per-job "applied" tracking.
2. **AI Mock Interviewer** — timed, proctored questions (MCQ / written / coding) built from your resume, the target role, and the company, graded by AI with rubric feedback.
3. **Skill Gap Analysis & Roadmap** — ATS keyword screen score, realistic acceptance chance, a multi-competency skill radar chart, and an actionable phased preparation roadmap that fits your timeline.
4. **Deep AI Skill Assessment** — timed, proctored test grounded in the exact technical skills claimed on your resume, verifying what you actually know and feeding an absolute 1–10 skill profile on your dashboard.

---

## Folder structure

```
job-genius/
├── backend/
│   ├── config/                       # db.js, plans.js (subscription tiers), timeLimits.js (per-question timers)
│   ├── middleware/                   # upload, error handling, requireAuth (JWT), enforceQuota
│   ├── models/                       # User, Resume, JobMatch, InterviewSession, SkillGapReport, SkillAssessment
│   │   └── shared/testSubSchemas.js  # question/grading sub-schemas shared by Interview + Assessment
│   ├── services/                     # groqClient (structured + grounded calls), aiSchemas, resumeParser, codeExecutionService
│   ├── controllers/                  # auth, billing, code-execution, jobMatcher, interview, skillAssessment, skillGap, dashboard
│   ├── routes/                       # authRoutes, billingRoutes, jobMatcherRoutes, interviewRoutes, skillAssessmentRoutes, skillGapRoutes
│   ├── server.js, package.json, .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js             # axios instance + centralized endpoint client functions
    │   ├── context/                  # AuthContext (session/plan/user), AppContext (toasts)
    │   ├── hooks/                    # useSpeechRecognition, useAsyncAction, useCountdown,
    │   │                             # useFaceMonitor, useTabVisibility, useCountUp
    │   ├── utils/                    # theme.js, authStorage.js, runJavaScript.js (sandboxed JS exec)
    │   ├── components/
    │   │   ├── history/              # FeatureHistoryModal (rich list & detail history explorer with bounded scrolling)
    │   │   ├── results/              # JobMatcherResultView, SkillGapResultView (reusable full-fidelity result renderers)
    │   │   ├── layout/               # Sidebar, AppShell, AuthLayout, ProtectedRoute, ProctorPanel
    │   │   ├── quiz/                 # TestRunner (timer+proctoring+question UI), TestResults (shared by Interview & Assessment)
    │   │   ├── ui/                   # GlassCard, Button, Modal, AILoader, ProgressBar, Badge, FileDropzone,
    │   │   │                         # EmptyState, TextField, UsageMeter, QuotaExceededNotice, CodeEditor, QuestionTimer
    │   │   └── charts/               # ScoreGauge, SkillRadarChart
    │   ├── pages/                    # Login, Signup, Dashboard, JobMatcher, MockInterviewer,
    │   │                             # SkillGapAnalysis, SkillAssessment, Billing
    │   ├── styles/globals.css        # ← the single theme file (CSS variables)
    │   ├── App.jsx / main.jsx
    ├── tailwind.config.js, vite.config.js, package.json, .env.example
```

---

## Prerequisites

- **Node.js ≥ 20** (required by modern AI runtimes and Vite)
- **MongoDB** running locally (`mongodb://localhost:27017/job-genius`), or a free [Atlas](https://www.mongodb.com/atlas) cluster
- A **Groq API key** — create one at [console.groq.com/keys](https://console.groq.com/keys)
- A **webcam + a Chromium/WebKit browser** to test proctored features (camera + WebGL required; speech recognition uses Web Speech API)

## Setup

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env
# fill in GROQ_API_KEY, MONGODB_URI, JWT_SECRET (openssl rand -base64 32)
# STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PISTON_API_URL are optional
npm run dev
```

**2. Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`, sign up (Free plan, 15 AI requests/month to start), and try any tool.

---

## Core Features & Architecture

### Unified History & Past Sessions Explorer
Every tool in Job Genius automatically persists completed sessions to MongoDB (`JobMatch`, `InterviewSession`, `SkillAssessment`, `SkillGapReport`), scoped to the authenticated user.
- **Header Trigger Button**: Each feature page includes a dedicated **History** button.
- **Scrollable & Bounded Modal**: Opening history displays a modal bounded by `max-h-[88vh]` with internal `overflow-y-auto` custom scrollbars so the component never overflows the viewport.
- **List View**: Chronological cards show the exact timestamp, target role/company, score badges, and quick summary pills.
- **Full-Fidelity Detail View**: Clicking any past record renders the **exact same UI and components** as submitting a fresh form (no raw JSON!):
  - **Job Matcher**: Analyzed candidate profile summary, search & filter toolbar, interactive job cards with apply links, and role details modal.
  - **Mock Interviewer**: Company & role metadata, overall score gauge, topic-specific skill level bars, and the full question breakdown with your submitted answers and AI grading feedback.
  - **Skill Assessment**: Technical verification score gauge, skill levels, and detailed question rubric feedback.
  - **Skill Gap Analysis**: ATS score and acceptance chance gauges, executive summary, skill comparison radar chart, and the interactive phased roadmap.
- **"Open in Workspace" Button**: Allows loading any past session directly into your main active screen to continue working with it seamlessly.

### Quota: Charged Only on Success, Strictly Per-Account
`backend/middleware/enforceQuota.js` **reserves** a unit atomically before the AI call (a single `findOneAndUpdate` with a `$lt` filter preventing race conditions), then **automatically refunds it** if the request doesn't end in a 2xx response (`res.on("finish")` checks the status code). Only successful AI calls count against your monthly plan limit. Every read/write is scoped strictly by `_id: user._id` via verified JWT tokens.

### Client-Side Proctoring: Face Detection + Tab-Switch Monitoring
`frontend/src/hooks/useFaceMonitor.js` uses `@tensorflow-models/face-detection` with the `tfjs` runtime to check webcam presence once every second. `useTabVisibility.js` leverages the Page Visibility API.
- No video frames or biometric data are ever sent to the server.
- Proctoring violations trigger `POST /api/interview/:id/fail` or `/api/skill-assessment/:id/fail`, immediately recording a 0 score without consuming AI quota calls.

### Question Engine & Multi-Language Code Execution
Mock Interviewer and Skill Assessment generate questions mixing `mcq`, `text`, and `coding` formats (`backend/services/aiSchemas.js`), with server-computed per-question timers (`backend/config/timeLimits.js`).
- **JavaScript execution**: Runs safely in a client-side sandboxed Web Worker (`frontend/src/utils/runJavaScript.js`) without DOM or token access.
- **Other languages**: Routes through an optional backend Piston execution service (`backend/services/codeExecutionService.js`).
- **Grading robustness**: Groq evaluates submitted code against structural rubrics regardless of whether live execution was run.

### Two-Step AI Job Research Pipeline
To guarantee authentic job listings:
1. **Step 1 (Agentic Research)**: Calls `groq/compound` with native web search to find current openings at real tech companies and pull actual application URLs.
2. **Step 2 (Constrained Extraction)**: Passes the grounded research to Groq's structured output model (`strict: true`) to map fields into strict JSON without hallucinations. Each listing designates `linkType` as `"direct_posting"` or `"careers_page"`.

---

## API Reference

| Method | Endpoint | Description | Auth | Quota |
|---|---|---|---|---|
| POST | `/api/auth/signup` | Register new user account | Public | — |
| POST | `/api/auth/login` | Authenticate and obtain JWT token | Public | — |
| GET | `/api/auth/me` | Fetch active user profile and quota usage | Required | — |
| PATCH | `/api/auth/plan` | Update user subscription plan tier | Required | — |
| POST | `/api/job-matcher` | Upload resume PDF to match live job openings | Required | ✅ |
| GET | `/api/job-matcher/history` | Retrieve user's past job matching searches | Required | — |
| PATCH | `/api/job-matcher/:id/jobs/:jobIndex/apply` | Toggle applied status for a matched job | Required | — |
| POST | `/api/interview/questions` | Generate company-tailored mock interview questions | Required | ✅ |
| POST | `/api/interview/:sessionId/grade` | Grade submitted mock interview answers | Required | ✅ |
| POST | `/api/interview/:sessionId/fail` | Record a proctoring violation failure | Required | — |
| GET | `/api/interview/history` | Retrieve user's past mock interview sessions | Required | — |
| POST | `/api/skill-gap` | Analyze resume against JD and build roadmap | Required | ✅ |
| GET | `/api/skill-gap/history` | Retrieve user's past skill gap reports | Required | — |
| POST | `/api/skill-assessment/generate` | Generate resume-grounded skill verification test | Required | ✅ |
| POST | `/api/skill-assessment/:assessmentId/submit` | Grade skill assessment submissions | Required | ✅ |
| POST | `/api/skill-assessment/:assessmentId/fail` | Record proctoring violation for assessment | Required | — |
| GET | `/api/skill-assessment/history` | Retrieve user's past skill assessments | Required | — |
| POST | `/api/code-execution/run` | Execute code snippet (via Piston if configured) | Required | — |
| POST | `/api/billing/create-checkout-session` | Create Stripe checkout session for plans | Required | — |
| POST | `/api/billing/verify-session` | Verify Stripe checkout session payment | Required | — |
| POST | `/api/billing/cancel-subscription` | Cancel active plan subscription | Required | — |
| GET | `/api/dashboard` | Aggregated user stats, skill profile & activity | Required | — |
| GET | `/api/health` | Service health check | Public | — |

> **Note**: Quota ✅ indicates that successful AI responses deduct 1 credit from the user's monthly plan limit. Failures and validation errors do not consume quota.

---

## Development & Testing Tips

- **Switching Themes**: The application uses dark-mode glassmorphic styling by default configured in `frontend/src/styles/globals.css`.
- **Testing History**: Run any feature (e.g. Job Matcher or Skill Gap), then click the **History** button at the top right to verify that historical records display immediately with full UI cards.
- **Proctoring Verification**: You can test tab-switch violations by starting a test and briefly switching to another browser tab.
