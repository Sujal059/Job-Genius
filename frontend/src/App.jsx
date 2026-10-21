import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import JobMatcher from "./pages/JobMatcher";
import MockInterviewer from "./pages/MockInterviewer";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import SkillAssessment from "./pages/SkillAssessment";
import Billing from "./pages/Billing";

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider sits inside BrowserRouter but wraps everything else */}
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Application Suite */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="/job-matcher" element={<JobMatcher />} />
                <Route path="/mock-interviewer" element={<MockInterviewer />} />
                <Route path="/skill-gap" element={<SkillGapAnalysis />} />
                <Route path="/skill-assessment" element={<SkillAssessment />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent mb-4">
        <span className="font-mono text-xl font-bold">404</span>
      </div>
      <h2 className="font-display text-2xl font-semibold text-main">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted">The requested page or resource doesn&rsquo;t exist.</p>
      <div className="mt-6">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
