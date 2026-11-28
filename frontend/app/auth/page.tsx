"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, KeyRound, ArrowRight } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [otpSent, setOtpSent] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const switchMode = (next: Mode) => {
    setMode(next);
    setOtpSent(false);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.auth.login({ email, password });
        setSession(res.access_token, res.user);
        router.push("/");
      } else if (mode === "signup") {
        const res = await api.auth.signup({ full_name: fullName, email, password });
        setSession(res.access_token, res.user);
        router.push("/");
      } else if (mode === "forgot" && !otpSent) {
        const res = await api.auth.forgotPassword({ email });
        setOtpSent(true);
        setNotice(`${res.message} (Check your FastAPI terminal for the 6-digit OTP.)`);
      } else if (mode === "forgot" && otpSent) {
        const res = await api.auth.resetPassword({
          email,
          otp_code: otpCode,
          new_password: newPassword,
        });
        setNotice(res.message);
        setMode("login");
        setOtpSent(false);
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-6 md:py-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        <div className="mb-6">
          <span className="text-[11px] font-mono tracking-wider text-[var(--accent)]">
            ATELIER.AI ACCOUNT
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {mode === "login" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && (otpSent ? "Enter reset code" : "Reset your password")}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {mode === "login" && "Sign in with your email to access your saved designs and wardrobe."}
            {mode === "signup" && "One account for 3D Studio, AI Shopper, AR Try-On, and Wardrobe."}
            {mode === "forgot" && "We'll generate a 6-digit OTP valid for 15 minutes."}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-md py-2 transition ${
              mode === "login" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "text-[var(--muted)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-md py-2 transition ${
              mode === "signup" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "text-[var(--muted)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-400">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                Full Name
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                <User className="h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arun Kumar"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              Email Address
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
              <Mail className="h-4 w-4 text-[var(--muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {(mode === "login" || mode === "signup") && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                <Lock className="h-4 w-4 text-[var(--muted)]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          )}

          {mode === "forgot" && otpSent && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  6-Digit OTP Code
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                  <KeyRound className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-transparent text-sm tracking-widest outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  New Password
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
                  <Lock className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : otpSent
              ? "Update Password"
              : "Send Reset Code"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-5 text-center">
          {mode !== "forgot" ? (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition"
            >
              Forgot your password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}