# Job Genius — AI Career Copilot

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://www.mongodb.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Cloud-f55036.svg)](https://groq.com/)
[![Stripe Integration](https://img.shields.io/badge/Payments-Stripe-635bff.svg)](https://stripe.com/)
[![TensorFlow.js](https://img.shields.io/badge/Proctoring-TensorFlow.js-ff6f00.svg)](https://www.tensorflow.org/js)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Job Genius** is an end-to-end AI career copilot built on the **MERN** stack (MongoDB, Express, React, Node.js) with **Groq Cloud** ultra-fast reasoning models, production-grade **Stripe billing** subscriptions, **TensorFlow.js face tracking**, and real-time **anti-cheating proctored test environments**.

With one single uploaded resume, Job Genius powers four synchronized career preparation workflows, a telemetry dashboard, unified history explorer, and a complete subscriber billing lifecycle.

---

## Table of Contents

- [Key Highlights](#key-highlights)
- [Application Suite Overview](#application-suite-overview)
  - [1. Modern Interactive Landing Page](#1-modern-interactive-landing-page)
  - [2. AI Job Matcher](#2-ai-job-matcher)
  - [3. AI Mock Interviewer](#3-ai-mock-interviewer)
  - [4. ATS Skill Gap Analysis & Roadmap](#4-ats-skill-gap-analysis--roadmap)
  - [5. Deep AI Skill Assessment](#5-deep-ai-skill-assessment)
  - [6. Unified Telemetry Dashboard](#6-unified-telemetry-dashboard)
  - [7. Unified History Explorer](#7-unified-history-explorer)
- [Stripe Payment Gateway & Billing Architecture](#stripe-payment-gateway--billing-architecture)
  - [Subscription Tiers & Quota Limits](#subscription-tiers--quota-limits)
  - [Stripe Checkout Lifecycle Flow](#stripe-checkout-lifecycle-flow)
  - [Stripe Webhook Event Handling](#stripe-webhook-event-handling)
  - [Testing Stripe Locally via Stripe CLI](#testing-stripe-locally-via-stripe-cli)
  - [Development Plan Swap Fallback](#development-plan-swap-fallback)
- [Deep Architectural Dives](#deep-architectural-dives)
  - [Groq Structured Outputs & Fast Reasoning](#groq-structured-outputs--fast-reasoning)
  - [Zero-Risk Success-Only Quota Metering](#zero-risk-success-only-quota-metering)
  - [Client-Side Face Detection & Tab Proctoring](#client-side-face-detection--tab-proctoring)
  - [Dual-Engine Code Execution Environment](#dual-engine-code-execution-environment)
  - [Continuous Speech-to-Text Dictation](#continuous-speech-to-text-dictation)
  - [Dark & Light Glassmorphic Design System](#dark--light-glassmorphic-design-system)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables Configuration](#environment-variables-configuration)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
- [Installation & Quickstart](#installation--quickstart)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Optional Piston Code Execution Engine](#3-optional-piston-code-execution-engine)
- [Complete API Reference](#complete-api-reference)
- [Testing & Verification Guide](#testing--verification-guide)
- [Security & Production Hardening](#security--production-hardening)

---

## Key Highlights

- **Groq Cloud AI Acceleration**: Uses `openai/gpt-oss-120b` with JSON schema enforcement (`strict: true`) for deterministic, hallucination-free generation, plus `groq/compound` for web-grounded research.
- **Full Stripe Subscriptions**: Real Stripe Checkout sessions, dynamic payment verification, in-app plan upgrades/downgrades, customer portal lifecycle events, and automated Stripe webhooks with cryptographic HMAC signature verification.
- **Client-Side Anti-Cheating & Proctoring**: Real-time webcam face detection via TensorFlow.js (`@tensorflow-models/face-detection`) and tab-switch monitoring via the Page Visibility API. **100% private** — zero video frames or biometrics ever leave the candidate's browser.
- **Fair, Zero-Risk Quota Metering**: Atomic checks with lazy monthly rollover. Usage quota is charged **strictly upon successful HTTP 2xx completion** — server errors, AI rate limits, or validation failures never consume credits.
- **Dual-Engine Code Runner**: Integrated VS Code CodeMirror editor with instant client-side Web Worker sandboxing for JavaScript and an optional backend Piston engine for Python, Java, and C++.
- **Unified Full-Fidelity History**: Every completed job match, mock interview, skill gap report, and skill assessment is persisted to MongoDB and viewable via a modal matching the original live interface.

---

## Application Suite Overview

```
                          ┌────────────────────────┐
                          │   Landing Page (/)     │
                          └───────────┬────────────┘
                                      │ Auth (JWT)
                                      ▼
                       ┌──────────────────────────────┐
                       │    Unified Dashboard         │
                       │ (/dashboard telemetry & KPIs)│
                       └──────────────┬───────────────┘
          ┌─────────────────┬─────────┴─────────┬─────────────────┐
          ▼                 ▼                   ▼                 ▼
 ┌─────────────────┐┌────────────────┐ ┌────────────────┐ ┌────────────────┐
 │ AI Job Matcher  ││ AI Mock Loop   │ │ ATS Skill Gap  │ │ Deep Skill     │
 │ (/job-matcher)  ││(/mock-interview│ │ (/skill-gap)   │ │ Assessment     │
 │ Real tech roles ││MCQ+Text+Coding │ │ Radar + Sprint │ │(/skill-assess) │
 │ & apply portals ││Voice + Proctor │ │ Roadmaps       │ │1-10 benchmark  │
 └─────────────────┘└────────────────┘ └────────────────┘ └────────────────┘
          │                 │                   │                 │
          └─────────────────┴─────────┬─────────┴─────────────────┘
                                      │ Auto-Persisted Records
                                      ▼
                      ┌────────────────────────────────┐
                      │    Unified History Explorer    │
                      │  (List + Full-Fidelity Views)  │
                      └────────────────────────────────┘
                                      │ Stripe Checkout
                                      ▼
                      ┌────────────────────────────────┐
                      │    Stripe Billing & Quotas     │
                      │   (/billing: Free/Pro/Premium) │
                      └────────────────────────────────┘
```

### 1. Modern Interactive Landing Page
Route: `/` (`frontend/src/pages/Landing.jsx`)
- Sleek marketing presentation with animated floating mesh gradient orbs and dark/light mode toggle.
- Interactive tabbed feature showcase switching between live demos of Job Matcher, Mock Interviewer, Skill Gap, and Assessment.
- Interactive competitive comparison matrix vs traditional job boards and mock interview platforms.
- Integrated pricing cards linked to Stripe billing tiers and an interactive accordion FAQ.

### 2. AI Job Matcher
Route: `/job-matcher` (`frontend/src/pages/JobMatcher.jsx`)
- Parses uploaded PDF resumes via `pdf-parse` into clean plaintext and skills tokens.
- Generates at least **12 real, high-match tech job postings** from top tier tech firms (Stripe, Datadog, Vercel, Shopify, Airbnb, Google, etc.).
- Pulls authentic careers portal links and direct targeted job search URLs (Greenhouse, Lever, LinkedIn Jobs, Wellfound) categorized as `"direct_posting"` or `"careers_page"`.
- Calculates accurate 0–100 match fit scores, experience level ratings, and matched skill pills.
- Features real-time search, experience filter, minimum score filter, and persistent **"Applied" toggle tracking**.

### 3. AI Mock Interviewer
Route: `/mock-interviewer` (`frontend/src/pages/MockInterviewer.jsx`)
- Generates 12–16 tailored interview questions based on the candidate's resume, target company, role, and job description.
- Mixes **MCQ**, **written architectural/behavioral text**, and **coding challenges**.
- Enforces server-calculated per-question countdown timers (`backend/config/timeLimits.js`).
- Integrated **Speech-to-Text dictation** using the HTML5 Web Speech API with auto-reconnect logic.
- Live **camera proctoring panel**: warns candidate if face disappears or tab switches; auto-fails test on confirmed violations without spending AI quota.
- Provides comprehensive AI rubric grading, question-by-question explanations, and an absolute 1–10 topic competency breakdown.

### 4. ATS Skill Gap Analysis & Roadmap
Route: `/skill-gap` (`frontend/src/pages/SkillGapAnalysis.jsx`)
- Compares candidate resume against target job description and preparation timeline (e.g. "2 weeks", "1 month").
- Produces a calibrated **ATS keyword match score** (0–100) and a realistic **acceptance probability chance** (0–100).
- Renders an interactive **Recharts multi-competency radar chart** mapping candidate proficiency against role demands.
- Builds an actionable, phased sprint preparation roadmap with timeframe tags, focus competencies, and executable engineering tasks.

### 5. Deep AI Skill Assessment
Route: `/skill-assessment` (`frontend/src/pages/SkillAssessment.jsx`)
- Researches the candidate's declared resume stack to generate a rigorous, objective competency verification exam (12–16 questions).
- Covers algorithmic problems, concurrency, runtime internals, and system edge cases.
- Full camera + tab proctoring and per-question timers.
- Evaluates submitted answers and feeds an absolute 1–10 skill matrix displayed across the candidate's telemetry dashboard.

### 6. Unified Telemetry Dashboard
Route: `/dashboard` (`frontend/src/pages/Dashboard.jsx`)
- Complete candidate cockpit summarizing career readiness KPIs:
  - Average mock interview loop score
  - Average ATS match score across target roles
  - Total matched jobs and active applied count
  - Visual 1–10 skill profile radar and competency bars aggregated across all past evaluations
  - Recent activity feed linking directly into past sessions
  - Real-time plan quota usage meter

### 7. Unified History Explorer
Component: `frontend/src/components/history/FeatureHistoryModal.jsx`
- Available on every feature header via the `History` button.
- Clean bounded layout (`max-h-[88vh]`) with custom scrollbars preventing viewport overflow.
- **Dual Mode**:
  - **List View**: Chronological cards with timestamps, target companies, scores, and status tags.
  - **Full-Fidelity Detail View**: Re-renders past sessions using the exact same components as new submissions (`JobMatcherResultView`, `SkillGapResultView`, `TestResults`).
- **"Open in Workspace" Action**: Loads historical sessions directly into the active editing screen.

---

## Stripe Payment Gateway & Billing Architecture

Job Genius features a production-ready, non-simulated **Stripe** payment integration handling recurring monthly subscriptions, hosted checkout redirection, cryptographic webhook signature verification, and customer lifecycle management.

```
Candidate               Frontend (/billing)          Backend API (/api/billing)            Stripe Cloud
   │                           │                                │                                │
   │── Click "Upgrade" ───────>│                                │                                │
   │                           │── POST /create-checkout-session│                                │
   │                           │   { planId: "pro" } ──────────>│── stripe.checkout.sessions ────>│
   │                           │                                │   .create({ mode: 'sub' })     │
   │                           │<── return { url, sessionId } ──│<── returns session.url ────────│
   │<── Redirect candidate ────│                                │                                │
   │                           │                                │                                │
   │── Complete Card Payment on Stripe Hosted Checkout ─────────────────────────────────────────>│
   │                                                                                             │
   │<── Redirect back to: /billing?success=true&session_id=cs_test_... ──────────────────────────│
   │                           │                                                                 │
   │                           │── POST /verify-session ───────>│                                │
   │                           │   { sessionId, planId }        │── stripe.checkout.sessions ────>│
   │                           │                                │   .retrieve(sessionId)         │
   │                           │                                │<── status: 'complete' ─────────│
   │                           │                                │── Update user.subscriptionPlan │
   │                           │<── return { success: true } ───│                                │
   │                           │                                │                                │
   │                           │                                │<── POST /api/billing/webhook ──│
   │                           │                                │   (raw body + signature check) │
   │                           │                                │   - checkout.session.completed │
   │                           │                                │   - invoice.payment_succeeded  │
```

### Subscription Tiers & Quota Limits

All plan configurations are centralized in `backend/config/plans.js`:

| Plan Tier | Price | AI Request Allowance | Target Audience & Features |
|---|---|---|---|
| **Free Starter** | **$0** / month | **15 requests** / mo | Default upon signup. Full access to all 4 AI tools, dashboard telemetry, and unified history. |
| **Pro Career** | **$15** / month | **150 requests** / mo | 10x quota allowance. Priority Groq inference routing, full 16-question loops, live coding runner. |
| **Premium Unlimited** | **$49** / month | **Unlimited** (`null`) | Zero monthly quota cap. Unrestricted mock interviews, ATS calibrations, and VIP candidate support. |

### Stripe Checkout Lifecycle Flow

1. **Session Creation (`POST /api/billing/create-checkout-session`)**:
   - Validates that target plan is `"pro"` or `"premium"`.
   - Uses `stripe.checkout.sessions.create` with `mode: "subscription"`, line items with recurring monthly USD pricing, `customer_email`, and `metadata: { userId, planId }`.
   - Returns hosted Stripe Checkout URL (`session.url`).
2. **Payment Verification (`POST /api/billing/verify-session`)**:
   - When Stripe redirects the user back to `/billing?session_id={CHECKOUT_SESSION_ID}&success=true`, the client automatically calls `/verify-session`.
   - Backend calls `stripe.checkout.sessions.retrieve(sessionId)`.
   - Upon confirming `payment_status === "paid"` or `status === "complete"`, updates MongoDB `User` document with `subscriptionPlan`, `subscriptionStatus = "active"`, `stripeCustomerId`, and `stripeSubscriptionId`.
3. **In-App Subscription Cancellation (`POST /api/billing/cancel-subscription`)**:
   - Candidate clicks "Cancel Subscription" in the billing portal.
   - Backend invokes `stripe.subscriptions.cancel(user.stripeSubscriptionId)`.
   - Immediately downgrades account to `"free"`, marks status `"canceled"`, and unbinds the active Stripe subscription ID.

### Stripe Webhook Event Handling

The webhook listener is mounted at `POST /api/billing/webhook` before global body parsers in `backend/server.js`:

```javascript
// Stripe webhook requires raw body for cryptographic signature verification
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
```

The handler verifies `stripe-signature` against `process.env.STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()` and processes the following lifecycle events:

- `checkout.session.completed`: Sets `subscriptionPlan`, `subscriptionStatus: "active"`, and binds customer/subscription IDs.
- `customer.subscription.deleted`: Reverts account to `"free"` tier and sets `subscriptionStatus: "canceled"`.
- `invoice.payment_succeeded`: Sets `subscriptionStatus: "active"`.
- `invoice.payment_failed`: Marks `subscriptionStatus: "past_due"`, prompting user to update their payment method.

### Testing Stripe Locally via Stripe CLI

To test the entire Stripe checkout and webhook flow locally without deploying to a public server:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   # Windows (Scoop)
   scoop install stripe
   # macOS (Homebrew)
   brew install stripe/stripe-cli/stripe
   ```
2. Authenticate the CLI with your Stripe account:
   ```bash
   stripe login
   ```
3. Forward webhook events to your local backend server:
   ```bash
   stripe listen --forward-to localhost:5000/api/billing/webhook
   ```
4. Copy the webhook signing secret printed by the CLI (e.g. `whsec_...`) into `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_printed_signing_secret
   ```
5. Trigger test payments in your browser at `http://localhost:5173/billing` using Stripe's [test card numbers](https://stripe.com/docs/testing#cards).

### Development Plan Swap Fallback

For local testing without active Stripe API credentials, developers can switch tiers via the protected endpoint:
- **`PATCH /api/auth/plan`** with payload `{"plan": "pro"}` or `{"plan": "premium"}` immediately updates the plan in the database.

---

## Deep Architectural Dives

### Groq Structured Outputs & Fast Reasoning
- **Guaranteed Schema Conformance**: All question generation, grading, and ATS extraction calls use Groq's `response_format: { type: "json_schema", json_schema: { strict: true, schema } }`. Constrained decoding prevents malformed JSON or hallucinated fields.
- **Agentic Web Search**: The Job Matcher can leverage `groq/compound`'s native server-side web search tool for live tech openings and direct career portal links.
- **Fail-Safe Resilience**: Requests feature custom abort timeouts (30s for standard generation, 90s for search) and automatic exponential backoff retry on HTTP 429 rate limits or transient 5xx errors (`backend/services/groqClient.js`).

### Zero-Risk Success-Only Quota Metering
- Implemented in `backend/middleware/enforceQuota.js`.
- **Lazy Monthly Reset**: When a request arrives, if `user.usage.periodStart` belongs to a prior calendar month, `usage.count` is automatically reset to 0 without requiring a background cron job.
- **Zero-Risk Incurrence**: Quota is **never deducted upfront**. Usage count increments strictly after successful AI response delivery (HTTP 2xx) via `req.recordQuotaSuccess()` or safe `res.on("finish")` hook. If Groq times out or fails, the user loses 0 credits.

### Client-Side Face Detection & Tab Proctoring
- **Face Monitor** (`frontend/src/hooks/useFaceMonitor.js`): Uses `@tensorflow-models/face-detection` with MediaPipe and the WebGL backend. Runs a lightweight frame check once per second. If no face is detected for 5 consecutive seconds, it triggers a proctoring violation.
- **Tab Monitor** (`frontend/src/hooks/useTabVisibility.js`): Hooks into the browser's Page Visibility API (`visibilitychange`). Switching tabs or minimizing the window instantly triggers a violation.
- **Zero Privacy Risk**: All computer vision inference executes inside the candidate's browser WebGL context. **No video frames, biometric models, or audio streams are ever transmitted to or stored on the server**.
- **Violations**: Reported to `/api/interview/:id/fail` or `/api/skill-assessment/:id/fail`. Automatically marks status as `"failed-proctoring"` with 0 score without deducting AI quota credits.

### Dual-Engine Code Execution Environment
1. **Client-Side Web Worker (JavaScript)**:
   - Evaluates code in a dedicated background `Worker` (`frontend/src/utils/runJavaScript.js`).
   - Isolated thread: infinite loops cannot lock the browser UI, and worker scripts have zero access to `window`, `document`, cookies, or JWT storage.
   - Captures `console.log` output and return values with a 5-second execution timeout.
2. **Backend Piston Engine (Python, Java, C++)**:
   - Routes through `POST /api/code-execution/run` to a Piston execution service (`backend/services/codeExecutionService.js`).
   - Graceful degradation: if `PISTON_API_URL` is unconfigured, coding answers are still fully graded by AI against structural rubrics.

### Continuous Speech-to-Text Dictation
- Encapsulated in `frontend/src/hooks/useSpeechRecognition.js`.
- Resolves a notorious Chromium bug where `continuous: true` speech recognition silently terminates on brief pauses.
- Uses ref-based user intent tracking to automatically and transparently restart the Web Speech engine until the candidate explicitly clicks Stop.

### Dark & Light Glassmorphic Design System
- Centrally defined in `frontend/src/styles/globals.css` with CSS custom variables:
  - Dark Mode (`data-theme="dark"` default): Deep obsidian `#0a0b10` with cyan and violet accents, semi-transparent glass cards (`rgba(16, 18, 27, 0.7)`), and subtle ambient borders.
  - Light Mode (`data-theme="light"`): Crisp slate `#f8fafc` background with balanced contrast and refined glass elevation.
- Responsive sidebar navigation (`Sidebar.jsx`) with mobile drawer support, animated loaders (`AILoader.jsx`), and score gauges (`ScoreGauge.jsx`).

---

## Project Directory Structure

```
job-genius/
├── README.md                          # Project documentation & guides
├── backend/
│   ├── config/
│   │   ├── db.js                      # Mongoose connection & pool config
│   │   ├── plans.js                   # Source of truth: Free, Pro, Premium tiers & limits
│   │   └── timeLimits.js              # Per-question countdown limits (MCQ, Text, Coding)
│   ├── controllers/
│   │   ├── authController.js          # Signup, login, profile, plan switcher
│   │   ├── billingController.js       # Stripe Checkout, verification, cancellation, webhook
│   │   ├── codeExecutionController.js # Multi-language code runner controller
│   │   ├── dashboardController.js     # Telemetry aggregation & candidate KPI stats
│   │   ├── interviewController.js     # Mock interview generation, grading, fail & history
│   │   ├── jobMatcherController.js    # Resume parsing, job matching, applied tracking & history
│   │   ├── skillAssessmentController.js# Deep skill test generation, grading, fail & history
│   │   └── skillGapController.js      # ATS keyword gap analysis, roadmap generator & history
│   ├── middleware/
│   │   ├── enforceQuota.js            # Lazy reset & success-only AI quota enforcement
│   │   ├── errorMiddleware.js         # Centralized AppError handler & 404 router
│   │   ├── requireAuth.js             # JWT verification & req.userId injector
│   │   └── uploadMiddleware.js        # Multer memory storage (PDF resumes, 8MB max)
│   ├── models/
│   │   ├── InterviewSession.js        # Mock interview questions, answers, scores & telemetry
│   │   ├── JobMatch.js                # Matched jobs, match fit scores, applied tracking
│   │   ├── Resume.js                  # Uploaded resume text snapshot & extracted skills
│   │   ├── SkillAssessment.js         # Skill verification questions, grading & 1-10 levels
│   │   ├── SkillGapReport.js          # ATS score, acceptance chance, radar comparison, roadmap
│   │   ├── User.js                    # Account credentials, Stripe IDs, subscription & usage
│   │   └── shared/
│   │       └── testSubSchemas.js      # Shared schemas for question items and answer grading
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth (rate-limited signup/login, /me, /plan)
│   │   ├── billingRoutes.js           # /api/billing (checkout, verify, cancel)
│   │   ├── codeExecutionRoutes.js     # /api/code-execution (run)
│   │   ├── dashboardRoutes.js         # /api/dashboard
│   │   ├── interviewRoutes.js         # /api/interview (questions, grade, fail, history)
│   │   ├── jobMatcherRoutes.js        # /api/job-matcher (match, apply, history)
│   │   ├── skillAssessmentRoutes.js   # /api/skill-assessment (generate, submit, fail, history)
│   │   └── skillGapRoutes.js          # /api/skill-gap (analyze, history)
│   ├── services/
│   │   ├── aiSchemas.js               # Strict JSON schemas for Groq Structured Outputs
│   │   ├── codeExecutionService.js    # Piston runtime client & language alias resolver
│   │   ├── groqClient.js              # Groq SDK wrapper (strict JSON & grounded search)
│   │   └── resumeParser.js            # pdf-parse wrapper extracting clean text & page count
│   ├── utils/
│   │   ├── AppError.js                # Operational HTTP error class with status & details
│   │   └── asyncHandler.js            # Express async route exception wrapper
│   ├── server.js                      # Express app boot, middleware chain & webhook route
│   ├── package.json                   # Backend dependencies & scripts
│   └── .env.example                   # Complete backend environment template
│
└── frontend/
    ├── public/                        # Static assets & favicon
    ├── src/
    │   ├── api/
    │   │   └── client.js              # Axios instance, JWT interceptor, all API client calls
    │   ├── components/
    │   │   ├── charts/
    │   │   │   ├── ScoreGauge.jsx     # Animated circular SVG score gauge
    │   │   │   └── SkillRadarChart.jsx# Recharts radar visualizer for competency comparison
    │   │   ├── history/
    │   │   │   └── FeatureHistoryModal.jsx # Unified bounded modal (list & full-fidelity view)
    │   │   ├── layout/
    │   │   │   ├── AppShell.jsx       # Main layout with responsive sidebar & user profile
    │   │   │   ├── AuthLayout.jsx     # Sleek glassmorphic card layout for login/signup
    │   │   │   ├── ProctorPanel.jsx   # Webcam video feed, face indicator & violation alerts
    │   │   │   ├── ProtectedRoute.jsx # Route guard redirecting unauthenticated users to /login
    │   │   │   └── Sidebar.jsx        # Navigation sidebar with real-time quota meter
    │   │   ├── quiz/
    │   │   │   ├── TestResults.jsx    # Shared results renderer (score gauge, rubrics, feedback)
    │   │   │   └── TestRunner.jsx     # Shared test runner (timers, proctoring, CodeEditor)
    │   │   ├── results/
    │   │   │   ├── JobMatcherResultView.jsx # Job cards, filters, search & role detail modal
    │   │   │   └── SkillGapResultView.jsx   # ATS gauges, radar chart, sprint roadmap cards
    │   │   ├── ui/
    │   │   │   ├── AILoader.jsx       # Glowing multi-step AI inference spinner
    │   │   │   ├── Badge.jsx          # Styled status pills and difficulty chips
    │   │   │   ├── Button.jsx         # Accessible button with loading states and tones
    │   │   │   ├── CodeEditor.jsx     # CodeMirror editor with multi-language syntax support
    │   │   │   ├── EmptyState.jsx     # Informative empty state card with action buttons
    │   │   │   ├── FileDropzone.jsx   # Drag-and-drop resume PDF upload zone
    │   │   │   ├── GlassCard.jsx      # Glassmorphism container with backdrop blur
    │   │   │   ├── JobGeniusLogo.jsx  # Scalable branding SVG logo with gradient mark
    │   │   │   ├── Modal.jsx          # Accessible dialog modal with ESC key dismiss
    │   │   │   ├── ProgressBar.jsx    # Smooth animated progress indicator
    │   │   │   ├── QuestionTimer.jsx  # Circular visual countdown question timer
    │   │   │   ├── QuotaExceededNotice.jsx # Warning banner prompting subscription upgrade
    │   │   │   ├── TextField.jsx      # Styled input & textarea with error messages
    │   │   │   └── UsageMeter.jsx     # Monthly credit progress bar with plan indicator
    │   │   └── HistoryButton.jsx      # Reusable header action button triggering history
    │   ├── context/
    │   │   ├── AppContext.jsx         # Global notifications and toast provider
    │   │   └── AuthContext.jsx        # User authentication, JWT session & profile refresh
    │   ├── hooks/
    │   │   ├── useAsyncAction.js      # Loading & error wrapper for async operations
    │   │   ├── useCountUp.js          # Smooth numeric increment animation hook
    │   │   ├── useCountdown.js        # Accurate interval countdown timer hook
    │   │   ├── useFaceMonitor.js      # TensorFlow.js face presence detector hook
    │   │   ├── useSpeechRecognition.js# Continuous speech dictation with auto-reconnect
    │   │   └── useTabVisibility.js    # Page Visibility API tab-switch detector hook
    │   ├── pages/
    │   │   ├── Billing.jsx            # Stripe subscription plans, checkout & usage status
    │   │   ├── Dashboard.jsx          # Candidate telemetry KPIs, skill profile & recent activity
    │   │   ├── JobMatcher.jsx         # AI Job Matcher tool & active workspace
    │   │   ├── Landing.jsx            # Marketing landing page, demos, comparison & FAQ
    │   │   ├── Login.jsx              # Candidate authentication page
    │   │   ├── MockInterviewer.jsx    # Company-tailored mock interview setup & runner
    │   │   ├── Signup.jsx             # Account registration page
    │   │   ├── SkillAssessment.jsx    # Deep resume skill verification setup & runner
    │   │   └── SkillGapAnalysis.jsx   # ATS gap analyzer & sprint roadmap generator
    │   ├── styles/
    │   │   └── globals.css            # Central design tokens, glassmorphism & themes
    │   ├── utils/
    │   │   ├── authStorage.js         # LocalStorage token getter/setter/clearer
    │   │   ├── runJavaScript.js       # Sandboxed client-side Web Worker execution
    │   │   └── theme.js               # Theme state helper (dark/light)
    │   ├── App.jsx                    # Client route definitions & provider hierarchy
    │   └── main.jsx                   # React 18 DOM mount
    ├── index.html                     # HTML5 root with Google Fonts (Inter & Outfit)
    ├── package.json                   # Frontend dependencies & scripts
    ├── tailwind.config.js             # Tailwind theme extension & custom utilities
    ├── vite.config.js                 # Vite bundler configuration
    └── .env.example                   # Frontend environment template
```

---

## Prerequisites

- **Node.js ≥ 20.0.0** (Required for Groq SDK, modern ES Modules, and Vite).
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/job-genius`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
- **Groq Cloud API Key**: Obtain a free API key at [console.groq.com/keys](https://console.groq.com/keys).
- **Stripe Account** (Optional for paid subscriptions): Obtain test keys at [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).
- **Webcam & Modern Browser**: Chromium or WebKit browser with WebGL and microphone permissions enabled for proctored testing and speech-to-text.

---

## Environment Variables Configuration

### Backend (.env)

Create `backend/.env` (based on `backend/.env.example`):

| Variable | Type | Default / Example | Required | Purpose |
|---|---|---|---|---|
| `PORT` | Number | `5000` | No | HTTP port for the Express backend server. |
| `NODE_ENV` | String | `development` | No | Environment mode (`development` or `production`). |
| `MONGODB_URI` | String | `mongodb://127.0.0.1:27017/job-genius` | **Yes** | MongoDB connection string (local or Atlas cluster). |
| `CLIENT_ORIGIN` | String | `http://localhost:5173` | **Yes** | Frontend origin allowed by CORS & used for Stripe redirect URLs. |
| `JWT_SECRET` | String | *Random 32-byte secret* | **Yes** | Signing key for JWT tokens (`openssl rand -base64 32`). |
| `JWT_EXPIRES_IN` | String | `30d` | No | Token expiration duration (default 30 days). |
| `GROQ_API_KEY` | String | `gsk_...` | **Yes** | Groq Cloud API key for all AI reasoning and generation. |
| `GROQ_MODEL` | String | `openai/gpt-oss-120b` | No | Model for schema-constrained outputs (`strict: true`). |
| `GROQ_SEARCH_MODEL` | String | `groq/compound` | No | Agentic model with built-in web search for live job listings. |
| `GROQ_TIMEOUT_MS` | Number | `30000` | No | Hard timeout for structured generation calls (milliseconds). |
| `GROQ_SEARCH_TIMEOUT_MS` | Number | `90000` | No | Timeout for grounded web search calls (milliseconds). |
| `MAX_RESUME_SIZE_BYTES` | Number | `8388608` | No | Maximum resume PDF upload size (8MB default). |
| `PISTON_API_URL` | String | `http://localhost:2000/api/v2` | No | Base URL for Piston code runner. Leave empty to disable non-JS runs. |
| `STRIPE_SECRET_KEY` | String | `sk_test_...` | Optional | Stripe Secret Key for Checkout and Subscriptions. |
| `STRIPE_WEBHOOK_SECRET` | String | `whsec_...` | Optional | Stripe Webhook Secret for HMAC signature verification. |

### Frontend (.env)

Create `frontend/.env` (based on `frontend/.env.example`):

| Variable | Type | Default / Example | Required | Purpose |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | String | `http://localhost:5000/api` | **Yes** | Base URL of the backend API endpoints. |

---

## Installation & Quickstart

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and supply your GROQ_API_KEY, MONGODB_URI, and JWT_SECRET

# Start development server with file watch
npm run dev
```

The backend API will start at `http://localhost:5000`. Verify by visiting `http://localhost:5000/api/health`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser. Register a new account (automatically granted the Free Starter plan with 15 monthly AI requests) and explore any tool.

### 3. Optional Piston Code Execution Engine

JavaScript coding challenges always execute immediately in the browser via a sandboxed Web Worker. To enable live code execution for **Python, Java, and C++**, run Piston via Docker:

```bash
docker run -d -p 2000:2000 --name piston engineer-man/piston
```

Then set `PISTON_API_URL=http://localhost:2000/api/v2` in `backend/.env` and restart the backend.

---

## Complete API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Description | Payload / Parameters | Auth | Quota |
|---|---|---|---|---|---|
| **GET** | `/api/health` | Service health status | — | Public | — |
| **POST** | `/api/auth/signup` | Register new user account | `{ name, email, password }` | Public (Rate Limited) | — |
| **POST** | `/api/auth/login` | Authenticate user & get JWT | `{ email, password }` | Public (Rate Limited) | — |
| **GET** | `/api/auth/me` | Current profile & monthly usage | — | Required | — |
| **PATCH** | `/api/auth/plan` | Direct subscription plan switch (Dev) | `{ plan: "free" \| "pro" \| "premium" }` | Required | — |
| **POST** | `/api/billing/create-checkout-session` | Create Stripe checkout session | `{ planId: "pro" \| "premium" }` | Required | — |
| **POST** | `/api/billing/verify-session` | Verify Stripe payment after redirect | `{ sessionId, planId }` | Required | — |
| **POST** | `/api/billing/cancel-subscription` | Cancel active Stripe subscription | — | Required | — |
| **POST** | `/api/billing/webhook` | Stripe lifecycle webhook listener | Raw body + `stripe-signature` header | Public | — |
| **POST** | `/api/job-matcher` | Match resume to live tech roles | `multipart/form-data`: `resume` (PDF), `comment` | Required | ✅ |
| **GET** | `/api/job-matcher/history` | Retrieve past job matching sessions | — | Required | — |
| **PATCH** | `/api/job-matcher/:id/jobs/:idx/apply` | Toggle "applied" status on job | `{ applied: boolean }` | Required | — |
| **POST** | `/api/interview/questions` | Generate tailored interview loop | `multipart/form-data`: `resume`, `companyName`, `jobDescription`, `jobRole` | Required | ✅ |
| **POST** | `/api/interview/:id/grade` | Grade submitted interview answers | `{ answers: [{ index, answer, codeLanguage?, runOutput? }] }` | Required | ✅ |
| **POST** | `/api/interview/:id/fail` | Record proctoring failure (face/tab) | `{ reason: "face-not-detected" \| "tab-switch", answers? }` | Required | — |
| **GET** | `/api/interview/history` | Retrieve past mock interview sessions | — | Required | — |
| **POST** | `/api/skill-gap` | Analyze ATS match & sprint roadmap | `multipart/form-data`: `resume`, `companyName`, `jobRole`, `jobDescription`, `timeLeft` | Required | ✅ |
| **GET** | `/api/skill-gap/history` | Retrieve past skill gap analyses | — | Required | — |
| **POST** | `/api/skill-assessment/generate` | Generate deep skill verification test | `multipart/form-data`: `resume` (PDF) | Required | ✅ |
| **POST** | `/api/skill-assessment/:id/submit` | Grade skill assessment submission | `{ answers: [{ index, answer, codeLanguage?, runOutput? }] }` | Required | ✅ |
| **POST** | `/api/skill-assessment/:id/fail` | Record assessment proctoring violation | `{ reason: "face-not-detected" \| "tab-switch", answers? }` | Required | — |
| **GET** | `/api/skill-assessment/history` | Retrieve past skill assessments | — | Required | — |
| **POST** | `/api/code-execution/run` | Execute code snippet via Piston | `{ language: "python" \| "java" \| "cpp", code, stdin? }` | Required | — |
| **GET** | `/api/dashboard` | Aggregated telemetry, KPIs & skills | — | Required | — |

> **Quota ✅ Indicator**: Only successful AI responses (HTTP 2xx) deduct 1 unit from the monthly quota limit. Proctoring violations, validation errors, and server faults do not consume quota credits.

---

## Testing & Verification Guide

Follow this systematic checklist to verify all systems across the application:

1. **Authentication & Security**:
   - Register a new account at `/signup` (password must be at least 8 characters).
   - Sign out and log back in at `/login`.
   - Verify that invalid credentials return an ambiguous error without leaking account existence.
   - Verify rate limiting: submitting 20 invalid requests within 15 minutes triggers HTTP 429.
2. **AI Job Matcher**:
   - Upload any tech resume PDF and provide target preference keywords (e.g. "Senior Backend Engineer, Go, distributed systems").
   - Confirm extraction of seniority, candidate summary, and at least 12 jobs with match scores.
   - Click the "Mark Applied" checkbox on any job card; refresh the page and verify state persistence.
   - Click the **History** button in the header; verify your search appears and can be reopened in full fidelity.
3. **AI Mock Interviewer with Proctoring & Speech**:
   - Enter a target company (e.g. "Stripe") and paste a job description.
   - Allow camera and microphone permissions when prompted.
   - Verify that the webcam preview appears in the `ProctorPanel`.
   - Test speech dictation: click the mic button on a text question and speak; verify real-time transcription.
   - Test code execution: select JavaScript on a coding question, write `console.log("Hello from Worker"); return 42;`, and click "Run Code".
   - Test proctoring: switch away to another browser tab for 2 seconds. Return and verify the session has recorded a proctoring violation failure with score 0 without spending quota.
4. **ATS Skill Gap Analysis & Roadmap**:
   - Submit a resume with target role "Staff Infrastructure Engineer" and timeframe "3 weeks".
   - Confirm rendering of ATS gauge, acceptance chance gauge, Recharts radar chart, and phased sprint cards.
   - Check the **History** modal to verify persistent reporting.
5. **Deep Skill Assessment**:
   - Generate an assessment from your resume.
   - Answer several MCQs and submit the test.
   - Confirm the AI grading breakdown, rubric explanations, and 1–10 competency scores.
6. **Telemetry Dashboard**:
   - Navigate to `/dashboard`.
   - Verify that average interview scores, average ATS scores, total jobs matched, and the unified skill radar chart update dynamically based on your completed sessions.
7. **Stripe Billing Lifecycle**:
   - Navigate to `/billing`.
   - Verify the usage meter reflects your current plan (Free Starter: 15 requests).
   - Click "Upgrade to Pro" to test Stripe Checkout redirection.
   - If using Stripe CLI, complete the payment and verify instant upgrade to 150 requests and active subscription status.
   - Click "Cancel Subscription" and verify immediate account reversion to the Free tier.
8. **Theme Toggle**:
   - Click the theme toggle button (Sun/Moon) in the sidebar or landing page.
   - Verify smooth transitions between obsidian glass dark mode and clean light mode.

---

## Security & Production Hardening

- **Cryptographic Webhook Verification**: `/api/billing/webhook` uses raw body parsing (`express.raw`) and Stripe HMAC signature validation to prevent spoofed subscription upgrades.
- **Strict Tenant Isolation**: All database operations in controllers and dashboard aggregations are strictly filtered by `req.userId` derived from the verified JWT.
- **Password Protection**: Passwords are encrypted with bcrypt (10 salt rounds) and defined with `select: false` in Mongoose to prevent accidental serialization in API responses.
- **Credential Brute-Force Rate Limiting**: Sensitive auth endpoints (`/signup` and `/login`) are protected by `express-rate-limit` capped at 20 attempts per 15 minutes per IP.
- **Client-Side Proctoring Privacy**: All webcam video analysis runs locally in browser WebGL memory via TensorFlow.js. Zero frames, biometrics, or camera recordings are ever transmitted to backend servers.
- **Sandboxed Code Execution**: JavaScript runs in isolated Web Workers with no access to DOM, cookies, or localStorage. Compiled languages run through isolated Piston container runtimes with strict execution timeouts.

---

## License

This project is licensed under the [MIT License](LICENSE).
