"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { MdLogin, MdPersonOutline, MdArrowForward } from "react-icons/md";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "@/lib/AUth";
import { TEST_ACCOUNT } from "@/utils/localBackend";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const handleGuest = async () => {
    try {
      setPending(true);
      setNotice(null);
      await signInWithGoogle();
      router.replace("/home");
    } catch (e: any) {
      setNotice(e?.message || "Guest sign-in failed");
    } finally {
      setPending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    try {
      setPending(true);
      setNotice(null);
      await signInWithEmail(email, password);
      router.replace("/home");
    } catch (err: any) {
      setNotice(err?.message || "Sign in failed");
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setNotice("Passwords do not match");
      return;
    }

    try {
      setPending(true);
      setNotice(null);
      await signUpWithEmail(email, password);
      router.replace("/home");
    } catch (err: any) {
      setNotice(err?.message || "Sign up failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Ambient white glows */}
      <div className="pointer-events-none fixed left-[-100px] top-[-100px] z-0 h-[500px] w-[500px] rounded-full bg-white/5 blur-[100px]" />
      <div className="pointer-events-none fixed bottom-[-200px] right-[-100px] z-0 h-[600px] w-[600px] rounded-full bg-white/5 blur-[100px]" />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-white md:text-5xl">PulseMail</h1>
          <p className="mt-2 text-on-surface-variant">Precision Engineering for Communication.</p>
        </div>

        {/* Glass card */}
        <div className="flex w-full max-w-[480px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex shrink-0 border-b border-white/10">
            <button
              onClick={() => setTab("signin")}
              className={`mono-label flex-1 border-b-2 py-4 transition-colors ${
                tab === "signin" ? "border-white text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`mono-label flex-1 border-b-2 py-4 transition-colors ${
                tab === "signup" ? "border-white text-white" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="flex flex-col gap-4 p-8">
            {/* Test account hint */}
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
              <span className="mono-label text-on-surface-variant">
                Test — <span className="text-white">{TEST_ACCOUNT.email}</span> / <span className="text-white">{TEST_ACCOUNT.password}</span>
              </span>
            </div>

            {notice && (
              <div className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white/90">
                {notice}
              </div>
            )}

            {tab === "signin" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Field label="Email Address" name="email" type="email" placeholder="agent@pulsemail.io" autoComplete="email" disabled={pending} />
                <Field label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" disabled={pending} />

                <div className="mt-2 flex flex-col gap-3">
                  <button type="submit" disabled={pending} className="btn-primary w-full rounded-lg py-3">
                    Sign In
                    <MdLogin className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleGuest} disabled={pending} className="btn-outline w-full rounded-lg py-3">
                    Continue as guest
                    <MdPersonOutline className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Field label="Email Address" name="email" type="email" placeholder="new.agent@pulsemail.io" autoComplete="email" disabled={pending} />
                <Field label="Password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" disabled={pending} minLength={6} />
                <Field label="Confirm Password" name="confirm" type="password" placeholder="••••••••" autoComplete="new-password" disabled={pending} minLength={6} />

                <div className="mt-2 flex flex-col gap-3">
                  <button type="submit" disabled={pending} className="btn-primary w-full rounded-lg py-3">
                    Create Account
                    <MdArrowForward className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleGuest} disabled={pending} className="btn-outline w-full rounded-lg py-3">
                    Continue as guest
                    <MdPersonOutline className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex w-full shrink-0 flex-col items-center justify-between gap-2 border-t border-white/10 bg-[#050505]/80 px-6 py-6 backdrop-blur-md md:flex-row md:px-16">
        <span className="mono-label normal-case text-white/60">
          <span className="font-bold text-white">PulseMail</span> · © 2024 Precision Engineering.
        </span>
      </footer>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  disabled,
  minLength,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  minLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`f-${name}`} className="mono-label text-white/60">
        {label}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        minLength={minLength}
        className="glass-input"
      />
    </div>
  );
}
