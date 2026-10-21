import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { UserPlus } from "lucide-react";
import { AuthLayout } from "../components/layout/AuthLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard", { replace: true });
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
            <h1 className="font-display text-xl font-semibold text-main">Create your account</h1>
            <p className="mt-1 text-sm text-muted">Free to start — no card required</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" required />
            <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              hint="At least 8 characters."
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" variant="gradient" icon={UserPlus} loading={loading} className="mt-2 w-full justify-center font-semibold shadow-glow-accent">
              Create Free Account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </AuthLayout>
  );
}
