import axios from "axios";
import { getToken, clearToken } from "../utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * The one axios instance the whole app uses. Every request automatically
 * carries the signed-in user's JWT (see utils/authStorage.js) so the
 * backend knows who's asking.
 */
export const apiClient = axios.create({ baseURL: BASE_URL, timeout: 90000 });

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize every failure into a single, friendly Error so every
    // caller can just do `catch (err) { showToast(err.message) }`.
    if (!error.response) {
      return Promise.reject(
        new Error("Can't reach the Job Genius server. Is the backend running on port 5000?")
      );
    }

    // Session expired or token invalid mid-use — clear it and send the
    // person back to sign in. A hard redirect (not a router navigate) is
    // deliberate here: this interceptor runs outside React, and a fresh
    // load is the simplest way to guarantee AuthContext re-initializes
    // with a clean slate.
    if (error.response.status === 401 && getToken()) {
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const message =
      error.response.data?.message ||
      `Request failed (${error.response.status}). Please try again.`;
    const wrapped = new Error(message);
    wrapped.status = error.response.status;
    wrapped.details = error.response.data?.details;
    return Promise.reject(wrapped);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export async function signup({ name, email, password }) {
  const { data } = await apiClient.post("/auth/signup", { name, email, password });
  return data.data;
}

export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.data;
}

export async function getMe() {
  const { data } = await apiClient.get("/auth/me");
  return data.data;
}

export async function updatePlan(plan) {
  const { data } = await apiClient.patch("/auth/plan", { plan });
  return data.data;
}

// ── Stripe Billing & Subscriptions ─────────────────────────────────────────
export async function createCheckoutSession(planId) {
  const { data } = await apiClient.post("/billing/create-checkout-session", { planId });
  return data;
}

export async function verifyCheckoutSession(sessionId, planId) {
  const { data } = await apiClient.post("/billing/verify-session", { sessionId, planId });
  return data;
}

export async function cancelSubscription() {
  const { data } = await apiClient.post("/billing/cancel-subscription");
  return data;
}

// ── Code execution (the "Run" button on coding questions) ──────────────
export async function runCode({ language, code, stdin }) {
  const { data } = await apiClient.post("/code-execution/run", { language, code, stdin });
  return data.data;
}

// ── 1. AI Job Matcher ────────────────────────────────────────────────────
export async function matchJobs({ resumeFile, comment }) {
  const form = new FormData();
  form.append("resume", resumeFile);
  if (comment) form.append("comment", comment);
  const { data } = await apiClient.post("/job-matcher", form);
  return data.data;
}

export async function getJobMatchHistory() {
  const { data } = await apiClient.get("/job-matcher/history");
  return data.data;
}

export async function getInterviewHistory() {
  const { data } = await apiClient.get("/interview/history");
  return data.data;
}

export async function getAssessmentHistory() {
  const { data } = await apiClient.get("/skill-assessment/history");
  return data.data;
}

export async function getSkillGapHistory() {
  const { data } = await apiClient.get("/skill-gap/history");
  return data.data;
}

export async function setJobApplied(jobMatchId, jobIndex, applied) {
  const { data } = await apiClient.patch(`/job-matcher/${jobMatchId}/jobs/${jobIndex}/apply`, { applied });
  return data.data;
}

// ── 2. AI Mock Interviewer ───────────────────────────────────────────────
export async function generateInterviewQuestions({ resumeFile, companyName, jobDescription, jobRole }) {
  const form = new FormData();
  form.append("resume", resumeFile);
  form.append("companyName", companyName);
  form.append("jobDescription", jobDescription);
  if (jobRole) form.append("jobRole", jobRole);
  const { data } = await apiClient.post("/interview/questions", form);
  return data.data;
}

export async function gradeInterview(sessionId, answers) {
  const { data } = await apiClient.post(`/interview/${sessionId}/grade`, { answers });
  return data.data;
}

export async function failInterview(sessionId, reason, answers = []) {
  const { data } = await apiClient.post(`/interview/${sessionId}/fail`, { reason, answers });
  return data.data;
}

// ── 3. Skill Gap Analysis & Roadmap ──────────────────────────────────────
export async function analyzeSkillGap({ resumeFile, companyName, jobRole, jobDescription, timeLeft }) {
  const form = new FormData();
  form.append("resume", resumeFile);
  form.append("companyName", companyName);
  form.append("jobRole", jobRole);
  form.append("jobDescription", jobDescription);
  form.append("timeLeft", timeLeft);
  const { data } = await apiClient.post("/skill-gap", form);
  return data.data;
}

// ── 4. Deep AI Skill Assessment ──────────────────────────────────────────
export async function generateSkillAssessment({ resumeFile }) {
  const form = new FormData();
  form.append("resume", resumeFile);
  const { data } = await apiClient.post("/skill-assessment/generate", form);
  return data.data;
}

export async function submitSkillAssessment(assessmentId, answers) {
  const { data } = await apiClient.post(`/skill-assessment/${assessmentId}/submit`, { answers });
  return data.data;
}

export async function failAssessment(assessmentId, reason, answers = []) {
  const { data } = await apiClient.post(`/skill-assessment/${assessmentId}/fail`, { reason, answers });
  return data.data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export async function getDashboard() {
  const { data } = await apiClient.get("/dashboard");
  return data.data;
}

export default apiClient;
