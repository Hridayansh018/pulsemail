"use client";
import supabase from "@/utils/supabase";


export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  // Redirect-based OAuth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      queryParams: {
        // prompt: "consent",
        // access_type: "offline",
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}


type CreateUserResult = {
  userId?: string;
  email?: string;
  requiresEmailConfirmation: boolean;
};

/**
 * Create a new user in Supabase using email/password.
 * Validates inputs and reports whether email confirmation is required.
 */
export async function createUserWithEmail(
  email: string,
  password: string
): Promise<CreateUserResult> {
  const emailStr = String(email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    throw new Error("Please provide a valid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const { data, error } = await supabase.auth.signUp({ email: emailStr, password });
  if (error) throw error;

  const user = data.user ?? null;
  const requiresEmailConfirmation = !user?.email_confirmed_at;

  return {
    userId: user?.id,
    email: user?.email ?? undefined,
    requiresEmailConfirmation,
  };
}

