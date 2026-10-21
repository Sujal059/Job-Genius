import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, setToken, clearToken } from "../utils/authStorage";
import { login as apiLogin, signup as apiSignup, getMe } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  // On first load, if a token is already saved, validate it against the
  // server and hydrate the user profile — this is what lets a refresh
  // keep you signed in instead of bouncing to /login every time.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const profile = await getMe();
        if (!cancelled) setUser(profile);
      } catch {
        clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: profile } = await apiLogin({ email, password });
    setToken(token);
    setUser(profile);
    return profile;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { token, user: profile } = await apiSignup({ name, email, password });
    setToken(token);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  /** Re-fetches the profile — call after anything that changes plan/usage. */
  const refreshUser = useCallback(async () => {
    const profile = await getMe();
    setUser(profile);
    return profile;
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
