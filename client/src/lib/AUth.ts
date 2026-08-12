"use client";
import {
  signIn,
  signUp,
  signInAsGuest,
  signOutLocal,
  getSessionUser,
} from "@/utils/localBackend";

export async function signUpWithEmail(email: string, password: string) {
  const user = signUp(email, password);
  // Local accounts are confirmed immediately.
  return { user: { ...user, email_confirmed_at: new Date().toISOString() } };
}

export async function signInWithEmail(email: string, password: string) {
  const user = signIn(email, password);
  return { user };
}

// No real OAuth in local mode — sign in as a persistent guest account.
export async function signInWithGoogle() {
  const user = signInAsGuest();
  return { user };
}

export async function signOut() {
  signOutLocal();
  return { success: true };
}

export async function getCurrentUser() {
  return getSessionUser();
}

type CreateUserResult = {
  userId?: string;
  email?: string;
  requiresEmailConfirmation: boolean;
};

/**
 * Create a new local user with email/password. Kept for API compatibility.
 */
export async function createUserWithEmail(
  email: string,
  password: string
): Promise<CreateUserResult> {
  const user = signUp(email, password);
  return {
    userId: user.id,
    email: user.email,
    requiresEmailConfirmation: false,
  };
}
