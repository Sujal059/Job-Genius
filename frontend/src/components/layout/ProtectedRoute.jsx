import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AILoader } from "../ui/AILoader";

/**
 * Used as a wrapping route in App.jsx: `<Route element={<ProtectedRoute />}>`.
 * While the initial session check is running, shows a full-page loader
 * instead of flashing the login page for a signed-in user on refresh.
 * Once resolved: signed out → bounce to /login (remembering where they were
 * headed); signed in → render the nested routes via <Outlet />.
 */
export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AILoader label="Loading Job Genius" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
