import type { Account, Profile, Result, Results, Theme } from './types';

const PROFILE_KEY = 'optiq.profile';
const RESULTS_KEY = 'optiq.results';
const ACCOUNT_KEY = 'optiq.account';
const SESSION_KEY = 'optiq.session';
const INTRO_KEY = 'optiq.intro';
const THEME_KEY = 'optiq.theme';
const OWNER_KEY = 'optiq.owner';

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage is unavailable, so progress will not persist
  }
}

export function loadProfile(): Profile | null {
  const p = read<Profile>(PROFILE_KEY);
  return p && typeof p.level === 'number' && typeof p.set === 'number' ? p : null;
}

export function saveProfile(profile: Profile): void {
  write(PROFILE_KEY, profile);
}

export function loadResults(): Results {
  return read<Results>(RESULTS_KEY) ?? {};
}

export function saveResult(quizId: string, score: number, total: number): Results {
  const all = loadResults();
  const prev = all[quizId];
  const next: Result = {
    best: prev ? Math.max(prev.best, score) : score,
    last: score,
    total,
    attempts: prev ? prev.attempts + 1 : 1,
  };
  const updated: Results = { ...all, [quizId]: next };
  write(RESULTS_KEY, updated);
  return updated;
}

export function saveResults(results: Results): void {
  write(RESULTS_KEY, results);
}

export function percent(r: Result): number {
  return r.total > 0 ? Math.round((r.best / r.total) * 100) : 0;
}

// Account and session. Mock only: nothing leaves the browser and no password is stored.
export function loadAccount(): Account | null {
  const a = read<Account>(ACCOUNT_KEY);
  return a && typeof a.name === 'string' && typeof a.email === 'string' ? a : null;
}

export function saveAccount(account: Account): void {
  write(ACCOUNT_KEY, account);
}

export function loadSignedIn(): boolean {
  return read<boolean>(SESSION_KEY) === true;
}

export function saveSignedIn(value: boolean): void {
  write(SESSION_KEY, value);
}

export function loadIntroSeen(): boolean {
  return read<boolean>(INTRO_KEY) === true;
}

export function saveIntroSeen(): void {
  write(INTRO_KEY, true);
}

export function loadTheme(): Theme {
  return read<Theme>(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: Theme): void {
  write(THEME_KEY, theme);
}

// Which signed-in user the cached data belongs to (cloud mode), so one student's
// cache is never shown to another on the same phone.
export function loadOwner(): string | null {
  return read<string>(OWNER_KEY);
}

export function saveOwner(id: string): void {
  write(OWNER_KEY, id);
}

export function clearUserData(): void {
  try {
    [PROFILE_KEY, RESULTS_KEY, ACCOUNT_KEY, SESSION_KEY, OWNER_KEY].forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // nothing to clear
  }
}
