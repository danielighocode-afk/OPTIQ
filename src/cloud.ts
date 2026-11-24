import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { NATIVE_REDIRECT } from './config';
import { supabase } from './supabase';
import type { Account, Profile, Result, Results } from './types';

function client() {
  if (!supabase) throw new Error('Backend is not configured');
  return supabase;
}

/** Where emails and Google send the student back to. */
export function redirectUrl(): string {
  return Capacitor.isNativePlatform() ? NATIVE_REDIRECT : window.location.origin + window.location.pathname;
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please verify your email first. Check your inbox for the link.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Please sign in.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (m.includes('password should be') || m.includes('weak')) return 'That password is too weak. Try a longer one.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No internet connection. Please try again.';
  return message;
}

// ---------- Session ----------

export async function getSession(): Promise<Session | null> {
  const { data } = await client().auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (event: AuthChangeEvent, session: Session | null) => void): () => void {
  const { data } = client().auth.onAuthStateChange(cb);
  return () => data.subscription.unsubscribe();
}

export async function signOut(): Promise<void> {
  await client().auth.signOut();
}

// ---------- Email and password ----------

export async function signUp(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<{ error?: string; needsVerification: boolean }> {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { data: { full_name: name, phone: phone ?? '' }, emailRedirectTo: redirectUrl() },
  });
  if (error) return { error: friendly(error.message), needsVerification: false };
  // With email confirmation on, an existing address comes back with no identities and no error.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'An account with this email already exists. Please sign in.', needsVerification: false };
  }
  return { needsVerification: !data.session };
}

export async function signIn(email: string, password: string): Promise<string | undefined> {
  const { error } = await client().auth.signInWithPassword({ email, password });
  return error ? friendly(error.message) : undefined;
}

export async function resendVerification(email: string): Promise<string | undefined> {
  const { error } = await client().auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectUrl() } });
  return error ? friendly(error.message) : undefined;
}

export async function sendPasswordReset(email: string): Promise<string | undefined> {
  const { error } = await client().auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
  return error ? friendly(error.message) : undefined;
}

export async function updatePassword(password: string): Promise<string | undefined> {
  const { error } = await client().auth.updateUser({ password });
  return error ? friendly(error.message) : undefined;
}

// ---------- Google ----------

export async function signInWithGoogle(): Promise<string | undefined> {
  const native = Capacitor.isNativePlatform();
  const { data, error } = await client().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl(), skipBrowserRedirect: native },
  });
  if (error) return friendly(error.message);
  if (native && data.url) await Browser.open({ url: data.url });
  return undefined;
}

/** Handles the link that brings the student back into the app (Google, email links, reset links). */
export async function handleAuthUrl(url: string): Promise<string | undefined> {
  if (!url.startsWith(NATIVE_REDIRECT)) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const problem = parsed.searchParams.get('error_description') ?? hash.get('error_description');
  if (problem) return friendly(problem.replace(/\+/g, ' '));
  const code = parsed.searchParams.get('code');
  if (!code) return undefined;
  const { error } = await client().auth.exchangeCodeForSession(code);
  return error ? friendly(error.message) : undefined;
}

// ---------- Profile ----------

interface ProfileRow {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  level: number | null;
  opt_set: number | null;
}

export async function fetchProfile(user: User): Promise<{ account: Account; profile: Profile | null }> {
  const { data, error } = await client()
    .from('profiles')
    .select('full_name, phone, avatar_url, level, opt_set')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();
  if (error) throw error;

  let row = data;
  if (!row) {
    // The sign-up trigger should have made this row. Create it if it is somehow missing.
    const meta = user.user_metadata ?? {};
    const fresh = { id: user.id, full_name: String(meta.full_name ?? meta.name ?? ''), avatar_url: (meta.avatar_url as string | undefined) ?? null };
    const { error: insertError } = await client().from('profiles').insert(fresh);
    if (insertError) throw insertError;
    row = { full_name: fresh.full_name, phone: null, avatar_url: fresh.avatar_url, level: null, opt_set: null };
  }

  const email = user.email ?? '';
  const account: Account = {
    name: row.full_name?.trim() || email.split('@')[0] || 'Student',
    email,
    phone: row.phone ?? undefined,
    avatar: row.avatar_url ?? undefined,
  };
  const profile = row.level != null && row.opt_set != null ? { level: row.level, set: row.opt_set } : null;
  return { account, profile };
}

export async function updateProfile(
  userId: string,
  patch: { full_name?: string; phone?: string | null; avatar_url?: string | null; level?: number; opt_set?: number },
): Promise<string | undefined> {
  const { error } = await client().from('profiles').update(patch).eq('id', userId);
  return error ? friendly(error.message) : undefined;
}

export async function uploadAvatar(userId: string, blob: Blob): Promise<string> {
  const path = userId + '/avatar.jpg';
  const { error } = await client().storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw error;
  const { data } = client().storage.from('avatars').getPublicUrl(path);
  return data.publicUrl + '?v=' + Date.now();
}

// ---------- Results ----------

interface ResultRow {
  quiz_id: string;
  best: number;
  last: number;
  total: number;
  attempts: number;
}

export async function fetchResults(userId: string): Promise<Results> {
  const { data, error } = await client().from('results').select('quiz_id, best, last, total, attempts').eq('user_id', userId);
  if (error) throw error;
  const out: Results = {};
  for (const r of (data ?? []) as ResultRow[]) {
    out[r.quiz_id] = { best: r.best, last: r.last, total: r.total, attempts: r.attempts };
  }
  return out;
}

export async function upsertResult(userId: string, quizId: string, r: Result): Promise<void> {
  const { error } = await client()
    .from('results')
    .upsert({ user_id: userId, quiz_id: quizId, best: r.best, last: r.last, total: r.total, attempts: r.attempts }, { onConflict: 'user_id,quiz_id' });
  if (error) throw error;
}

/** Combine scores saved on this device with scores in the cloud. Returns the merged set and what changed. */
export function mergeResults(local: Results, remote: Results): { merged: Results; changed: string[] } {
  const merged: Results = { ...remote };
  const changed: string[] = [];
  for (const [id, l] of Object.entries(local)) {
    const r = remote[id];
    if (!r) {
      merged[id] = l;
      changed.push(id);
    } else if (l.best > r.best || l.attempts > r.attempts) {
      merged[id] = { best: Math.max(l.best, r.best), last: r.last, total: r.total, attempts: Math.max(l.attempts, r.attempts) };
      changed.push(id);
    }
  }
  return { merged, changed };
}
