import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogIn } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard>
          <div className="mb-6 text-center">
            <h1 className="font-display text-xl font-semibold text-main">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to continue to Job Genius</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <TextField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="gradient" icon={LogIn} loading={loading} className="mt-2 w-full justify-center font-semibold shadow-glow-accent">
              Sign in to Copilot
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Don&rsquo;t have an account?{" "}
            <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
              Sign up
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </AuthLayout>
  );
}
