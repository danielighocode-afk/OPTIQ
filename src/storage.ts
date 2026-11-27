import type { Account, CourseRow, Profile, Question, Quiz, Result, Results, Theme, Topic } from './types';

const PROFILE_KEY = 'optiq.profile';
const RESULTS_KEY = 'optiq.results';
const ACCOUNT_KEY = 'optiq.account';
const SESSION_KEY = 'optiq.session';
const INTRO_KEY = 'optiq.intro';
const THEME_KEY = 'optiq.theme';
const OWNER_KEY = 'optiq.owner';
const QUIZ_CACHE_KEY = 'optiq.quizzes';
const COURSE_CACHE_KEY = 'optiq.courses';
const TOPIC_CACHE_KEY = 'optiq.topics';

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

/** Keep only well-formed quizzes, so a bad row can never crash a screen. */
export function sanitizeQuizzes(input: unknown): Quiz[] {
  if (!Array.isArray(input)) return [];
  const out: Quiz[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.courseCode !== 'string' || typeof r.title !== 'string' || !Array.isArray(r.questions)) continue;
    const questions: Question[] = [];
    for (const item of r.questions) {
      if (!item || typeof item !== 'object') continue;
      const q = item as Record<string, unknown>;
      if (typeof q.text !== 'string' || !q.text || !Array.isArray(q.options) || q.options.length < 2) continue;
      if (!q.options.every((o) => typeof o === 'string')) continue;
      const options = q.options as string[];
      const answer = q.answer;
      if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 0 || answer >= options.length) continue;
      const question: Question = { text: q.text, options, answer };
      if (typeof q.explanation === 'string' && q.explanation) question.explanation = q.explanation;
      questions.push(question);
    }
    if (questions.length > 0) out.push({ id: r.id, courseCode: r.courseCode, title: r.title, questions });
  }
  return out;
}

/** Keep only well-formed courses from the backend. */
export function sanitizeCourses(input: unknown): CourseRow[] {
  if (!Array.isArray(input)) return [];
  const out: CourseRow[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.code !== 'string' || !r.code || typeof r.title !== 'string' || !r.title || typeof r.group !== 'string' || !r.group) continue;
    if (typeof r.level !== 'number' || ![100, 200, 300, 400, 500, 600].includes(r.level)) continue;
    const course: CourseRow = { code: r.code, title: r.title, group: r.group, level: r.level, verified: r.verified !== false };
    if (r.semester === 1 || r.semester === 2) course.semester = r.semester;
    out.push(course);
  }
  return out;
}

/** Keep only well-formed topics from the backend. */
export function sanitizeTopics(input: unknown): Topic[] {
  if (!Array.isArray(input)) return [];
  const out: Topic[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || !r.id || typeof r.courseCode !== 'string' || !r.courseCode || typeof r.title !== 'string' || !r.title) continue;
    out.push({ id: r.id, courseCode: r.courseCode, position: typeof r.position === 'number' ? r.position : 0, title: r.title, body: typeof r.body === 'string' ? r.body : '' });
  }
  return out;
}

export function loadCourseCache(): CourseRow[] | null {
  const cached = read<unknown>(COURSE_CACHE_KEY);
  return Array.isArray(cached) ? sanitizeCourses(cached) : null;
}
export function saveCourseCache(list: CourseRow[]): void {
  write(COURSE_CACHE_KEY, list);
}
export function loadTopicCache(): Topic[] | null {
  const cached = read<unknown>(TOPIC_CACHE_KEY);
  return Array.isArray(cached) ? sanitizeTopics(cached) : null;
}
export function saveTopicCache(list: Topic[]): void {
  write(TOPIC_CACHE_KEY, list);
}

export function loadQuizCache(): Quiz[] | null {
  const cached = read<unknown>(QUIZ_CACHE_KEY);
  return Array.isArray(cached) ? sanitizeQuizzes(cached) : null;
}

export function saveQuizCache(list: Quiz[]): void {
  write(QUIZ_CACHE_KEY, list);
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
