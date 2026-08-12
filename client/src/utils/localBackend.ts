"use client";

/* ------------------------------------------------------------------ *
 * Local-only backend.
 *
 * Replaces Supabase auth + database tables with browser localStorage so
 * the app runs standalone with no external services. Data persists per
 * browser. Intended for local development / testing.
 * ------------------------------------------------------------------ */

export type LocalUser = { id: string; email: string };

type StoredUser = { id: string; email: string; password: string };

const USERS_KEY = "pm_users";
const SESSION_KEY = "pm_session";
const CONNECTIONS_KEY = "pm_connections";
const CAMPAIGNS_KEY = "pm_campaigns";
const AUTH_EVENT = "pm-auth-change";

/** Pre-seeded credentials so you can sign in immediately. */
export const TEST_ACCOUNT = { email: "test@pulsemail.dev", password: "test1234" };
const GUEST_EMAIL = "guest@pulsemail.dev";

export const KEYS = { CONNECTIONS: CONNECTIONS_KEY, CAMPAIGNS: CAMPAIGNS_KEY };

const isBrowser = () => typeof window !== "undefined";

export function nowISO(): string {
  return new Date().toISOString();
}

export function uid(): string {
  if (isBrowser() && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emitAuthChange(): void {
  if (isBrowser()) window.dispatchEvent(new Event(AUTH_EVENT));
}

function normalizeEmail(email: string): string {
  return String(email).trim().toLowerCase();
}

/* ---------------------------- Users ---------------------------- */
function getUsers(): StoredUser[] {
  const users = read<StoredUser[]>(USERS_KEY, []);
  // Ensure the seeded test account always exists.
  if (isBrowser() && !users.some((u) => u.email === TEST_ACCOUNT.email)) {
    users.push({ id: uid(), email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password });
    write(USERS_KEY, users);
  }
  return users;
}

function saveUsers(users: StoredUser[]): void {
  write(USERS_KEY, users);
}

/* --------------------------- Session --------------------------- */
export function getSessionUser(): LocalUser | null {
  return read<LocalUser | null>(SESSION_KEY, null);
}

export function getSessionUserId(): string | null {
  return getSessionUser()?.id ?? null;
}

function setSession(user: LocalUser | null): void {
  if (user) write(SESSION_KEY, user);
  else if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
  emitAuthChange();
}

/* --------------------------- Auth ops -------------------------- */
export function signUp(email: string, password: string): LocalUser {
  const e = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    throw new Error("Please provide a valid email address.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  const users = getUsers();
  if (users.some((u) => u.email === e)) {
    throw new Error("An account with this email already exists.");
  }
  const stored: StoredUser = { id: uid(), email: e, password };
  users.push(stored);
  saveUsers(users);

  const user = { id: stored.id, email: stored.email };
  setSession(user);
  return user;
}

export function signIn(email: string, password: string): LocalUser {
  const e = normalizeEmail(email);
  const users = getUsers();
  const match = users.find((u) => u.email === e);
  if (!match || match.password !== password) {
    throw new Error("Invalid email or password.");
  }
  const user = { id: match.id, email: match.email };
  setSession(user);
  return user;
}

export function signInAsGuest(): LocalUser {
  const users = getUsers();
  let guest = users.find((u) => u.email === GUEST_EMAIL);
  if (!guest) {
    guest = { id: uid(), email: GUEST_EMAIL, password: uid() };
    users.push(guest);
    saveUsers(users);
  }
  const user = { id: guest.id, email: guest.email };
  setSession(user);
  return user;
}

export function signOutLocal(): void {
  setSession(null);
}

/** Subscribe to auth state changes (same-tab and cross-tab). */
export function onAuthChange(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/* ---------------------- Scoped collections --------------------- */
export function readCollection<T>(key: string): T[] {
  return read<T[]>(key, []);
}

export function writeCollection<T>(key: string, rows: T[]): void {
  write(key, rows);
}
