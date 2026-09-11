import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("atom_trainer_hub_auth_session") === "true";
      if (isAuth) {
        throw redirect({ to: "/" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Administrator Sign In — ATOM Trainer Hub" },
      { name: "description", content: "Sign in to access ATOM Trainer Management Platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, login } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      setLoading(false);
      if (success) {
        navigate({ to: "/" });
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <img
            src="/atom-logo.png"
            alt="ATOM Logo"
            className="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Trainer Hub
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
           
          </p>
        </div>

        {/* Login Card */}
        <div className="card-surface p-8 shadow-xl rounded-2xl border border-border">
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="mb-1.5 block font-bold uppercase tracking-wider text-muted-foreground">
                User Name / Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  required
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Trainerdata@atomm.in"
                  className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} ATOM Technical Training Network • Confidential Enterprise
          System
        </p>
      </div>
    </div>
  );
}
