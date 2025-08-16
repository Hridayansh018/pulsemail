"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as supaSignOut,
  getCurrentUser,
} from "@/lib/AUth"; // <-- ensure this path exists

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogle = async () => {
    try {
      setPending(true);
      setNotice(null);
      await signInWithGoogle(); // redirects for OAuth
      router.replace('/home')
    } catch (e: any) {
      setNotice(e?.message || "Google sign-in failed");
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
      setNotice("Signed in successfully.");
      router.replace('/home')
      
      // optional: redirect, e.g., router.push("/dashboard")
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
      const res = await signUpWithEmail(email, password);
      const unconfirmed = !res.user?.email_confirmed_at;
      setNotice(
        unconfirmed
          ? "Account created. Check your email to confirm."
          : "Account created and signed in."
      );
      setIsLogin(true);
      router.replace('/home')
    } catch (err: any) {
      setNotice(err?.message || "Sign up failed");
    } finally {
      setPending(false);
    }
  };

  // Optional helpers for debugging:
  // const whoAmI = async () => console.log(await getCurrentUser());
  // const logout = async () => await supaSignOut();

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/bg2.jpg"
        alt="Background"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

      {/* Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div
          className="
            relative w-full max-w-3xl overflow-hidden
            rounded-2xl border border-white/20
            bg-white/10 backdrop-blur-md
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
          "
        >
          {/* Glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8">
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <button
              onClick={() => setIsLogin((v) => !v)}
              className="text-sm text-blue-200 hover:text-white hover:underline"
            >
              {isLogin ? "New here? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Notice */}
          {notice && (
            <div className="mx-6 mb-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/90 md:mx-8">
              {notice}
            </div>
          )}

          {/* Slider */}
          <div className="relative h-[500px]">
            <div
              className={`absolute inset-0 flex w-[200%] transition-transform duration-500 ease-in-out ${
                isLogin ? "translate-x-0" : "-translate-x-1/2"
              }`}
            >
              {/* Login */}
              <div className="w-1/2 shrink-0 px-6 pb-6 md:px-8">
                <LoginForm onSubmit={handleLogin} onGoogle={handleGoogle} pending={pending} />
                <BottomToggle isLogin onToggle={() => setIsLogin(false)} />
              </div>

              {/* Register */}
              <div className="w-1/2 shrink-0 px-6 pb-6 md:px-8">
                <RegisterForm onSubmit={handleRegister} onGoogle={handleGoogle} pending={pending} />
                <BottomToggle isLogin={false} onToggle={() => setIsLogin(true)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Subcomponents ---- */

function LoginForm({
  onSubmit,
  onGoogle,
  pending,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  pending?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="relative z-10 space-y-4 text-white">
      <div className="space-y-1">
        <label htmlFor="login-email" className="block text-sm font-medium text-white/90">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="name@example.com"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="login-password" className="block text-sm font-medium text-white/90">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="••••••••"
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-blue-600/90 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
      >
        Continue
      </button>

      <Divider label="or" />

      <button
        type="button"
        onClick={onGoogle}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </form>
  );
}

function RegisterForm({
  onSubmit,
  onGoogle,
  pending,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  pending?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="relative z-10 space-y-4 text-white">
      <div className="space-y-1">
        <label htmlFor="reg-email" className="block text-sm font-medium text-white/90">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="name@example.com"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-password" className="block text-sm font-medium text-white/90">
          Password
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="••••••••"
          disabled={pending}
          minLength={6}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-confirm" className="block text-sm font-medium text-white/90">
          Confirm password
        </label>
        <input
          id="reg-confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="••••••••"
          disabled={pending}
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-blue-600/90 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
      >
        Create account
      </button>

      <Divider label="or" />

      <button
        type="button"
        onClick={onGoogle}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </form>
  );
}

function BottomToggle({ isLogin, onToggle }: { isLogin: boolean; onToggle: () => void }) {
  return (
    <div className="mt-6 text-center text-sm text-white/80">
      {isLogin ? (
        <>
          New user?{" "}
          <button onClick={onToggle} className="font-medium text-blue-200 hover:text-white hover:underline">
            Create an account
          </button>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <button onClick={onToggle} className="font-medium text-blue-200 hover:text-white hover:underline">
            Sign in
          </button>
        </>
      )}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px w-full bg-white/20" />
      <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
      <span className="h-px w-full bg-white/20" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.2 0-5.8-2.6-5.8-5.8S8.8 6.2 12 6.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.9 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c6.9 0 9.2-4.8 9.2-7.3 0-.5-.1-.8-.1-1.1H12z" />
      <path fill="#34A853" d="M3.5 7.9l3.2 2.3C7.5 8.1 9.5 6.8 12 6.8c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.9 14.6 3 12 3 8.4 3 5.4 5 3.5 7.9z" />
      <path fill="#FBBC05" d="M12 21.4c2.6 0 4.8-.9 6.4-2.3l-3-2.5c-.8.5-1.9.9-3.4.9-2.2 0-4.1-1.5-4.8-3.5l-3.1 2.3c1.9 3 5 5.1 7.9 5.1z" />
      <path fill="#4285F4" d="M21.2 14.1c0-.5-.1-.8-.1-1.1H12v3.9h5.4c-.2 1.2-1.6 3.6-5.4 3.6-1.6 0-3-.6-4.1-1.5l3.1-2.3c.8.5 1.9.9 3.4.9 3.6 0 6.9-2.5 6.9-6.6z" />
    </svg>
  );
}
