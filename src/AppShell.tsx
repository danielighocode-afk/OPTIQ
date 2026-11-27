import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Activity, BookOpen, Home as HomeIcon, Trophy, User } from 'lucide-react';
import { useHashRoute } from './useHashRoute';
import {
  clearUserData,
  loadAccount,
  loadIntroSeen,
  loadOwner,
  loadProfile,
  loadResults,
  loadSignedIn,
  saveAccount,
  saveIntroSeen,
  saveOwner,
  saveProfile,
  saveCourseCache,
  saveQuizCache,
  saveTopicCache,
  saveResult,
  saveResults,
  saveSignedIn,
} from './storage';
import { setQuizzes } from './data/quizzes';
import { setCourses } from './data/courses';
import { setTopics } from './data/topics';
import TopicReader from './screens/TopicReader';
import { cloudEnabled } from './config';
import * as cloud from './cloud';
import type { Account, Profile as ProfileData, Results } from './types';
import Loader, { BootLoader } from './components/Loader';
import type { LoaderVariant } from './components/Loader';
import Splash from './screens/Splash';
import Auth from './screens/Auth';
import VerifyEmail from './screens/VerifyEmail';
import ResetPassword from './screens/ResetPassword';
import Intro from './screens/Intro';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Courses from './screens/Courses';
import CourseDetail from './screens/CourseDetail';
import Quizzes from './screens/Quizzes';
import QuizRunner from './screens/QuizRunner';
import Profile from './screens/Profile';
import Stats from './screens/Stats';
import Tutor from './screens/Tutor';

type AuthView = 'splash' | 'signup' | 'signin' | 'verify';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function AppShell() {
  const { path, go } = useHashRoute();

  // With a backend, accounts and scores come from the cloud and localStorage is only a cache.
  // Without one (no keys set), everything stays on this device as a preview.
  const [account, setAccount] = useState<Account | null>(() => (cloudEnabled ? null : loadAccount()));
  const [signedIn, setSignedIn] = useState<boolean>(() => (cloudEnabled ? false : loadSignedIn() && loadAccount() !== null));
  const [authView, setAuthView] = useState<AuthView>(() => (!cloudEnabled && loadAccount() ? 'signin' : 'splash'));
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [introSeen, setIntroSeen] = useState<boolean>(() => loadIntroSeen());
  const [profile, setProfile] = useState<ProfileData | null>(() => (cloudEnabled ? null : loadProfile()));
  const [results, setResults] = useState<Results>(() => (cloudEnabled ? {} : loadResults()));
  const [editing, setEditing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [authReady, setAuthReady] = useState(!cloudEnabled);
  const [syncing, setSyncing] = useState(false);
  const [, setQuizVersion] = useState(0); // bumped when the quiz list changes, to redraw the screens
  const [recovery, setRecovery] = useState(false);
  const [notice, setNotice] = useState('');
  const [loader, setLoader] = useState<{ variant: LoaderVariant; label: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const uid = useRef<string | null>(null);
  const loading = useRef<{ id: string; run: Promise<void> } | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 1300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? '' : current)), 4500);
  };

  // Messages from the Android return links (for example a Google sign-in that failed).
  useEffect(() => {
    const onNotice = (e: Event) => showNotice(String((e as CustomEvent).detail ?? ''));
    window.addEventListener('optiq:notice', onNotice);
    return () => window.removeEventListener('optiq:notice', onNotice);
  }, []);

  // Backend session: restore it on start and follow sign-in / sign-out.
  useEffect(() => {
    if (!cloudEnabled) return;
    // A ref (not a local flag) so a session load started before React's dev double-mount still lands.
    alive.current = true;

    // Fetch what was published in the admin dashboard (quizzes, courses, notes) and show it everywhere.
    const refreshQuizzes = async () => {
      const [quizzes, courses, topics] = await Promise.all([
        cloud.fetchQuizzes().catch(() => null),
        cloud.fetchCourses().catch(() => null),
        cloud.fetchTopics().catch(() => null),
      ]);
      if (!alive.current) return;
      let changed = false;
      if (quizzes) {
        saveQuizCache(quizzes);
        setQuizzes(quizzes);
        changed = true;
      }
      if (courses && courses.length > 0) {
        saveCourseCache(courses);
        setCourses(courses);
        changed = true;
      }
      if (topics) {
        saveTopicCache(topics);
        setTopics(topics);
        changed = true;
      }
      if (changed) setQuizVersion((v) => v + 1);
    };

    const load = async (session: Session) => {
      const id = session.user.id;
      setSyncing(true);
      void refreshQuizzes();
      const owner = loadOwner();
      if (owner && owner !== id) clearUserData(); // another student's cache
      try {
        const { account: acc, profile: prof } = await cloud.fetchProfile(session.user);
        const remote = await cloud.fetchResults(id);
        const local = loadOwner() === null || loadOwner() === id ? loadResults() : {};
        const { merged, changed } = cloud.mergeResults(local, remote);
        await Promise.all(changed.map((q) => cloud.upsertResult(id, q, merged[q]).catch(() => undefined)));
        if (!alive.current) return;
        saveOwner(id);
        saveAccount(acc);
        if (prof) saveProfile(prof);
        saveResults(merged);
        setAccount(acc);
        setProfile(prof);
        setResults(merged);
      } catch {
        // Offline or a server problem: use what this phone has cached for the same student.
        if (!alive.current) return;
        const cached = loadOwner() === id ? loadAccount() : null;
        if (cached) {
          setAccount(cached);
          setProfile(loadProfile());
          setResults(loadResults());
        } else {
          const meta = session.user.user_metadata ?? {};
          const email = session.user.email ?? '';
          setAccount({ name: String(meta.full_name ?? meta.name ?? '') || email.split('@')[0] || 'Student', email });
          setProfile(null);
          setResults({});
          showNotice('Could not reach the server. Some data may be missing.');
        }
      } finally {
        if (alive.current) {
          uid.current = id;
          setSignedIn(true);
          setSyncing(false);
        }
      }
    };

    const apply = (session: Session | null): Promise<void> => {
      if (!session) return Promise.resolve();
      if (loading.current?.id === session.user.id) return loading.current.run;
      const run = load(session);
      loading.current = { id: session.user.id, run };
      return run;
    };

    const signedOut = () => {
      loading.current = null;
      uid.current = null;
      clearUserData();
      setAccount(null);
      setProfile(null);
      setResults({});
      setEditing(false);
      setSignedIn(false);
      setAuthView('signin');
    };

    const unsubscribe = cloud.onAuthChange((event, session) => {
      // Do not call the backend directly inside this callback; hand off to the next tick.
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') window.setTimeout(signedOut, 0);
      else if (event === 'SIGNED_IN') window.setTimeout(() => void apply(session), 0);
    });

    cloud
      .getSession()
      .then((session) => apply(session))
      .catch(() => undefined)
      .finally(() => {
        if (alive.current) setAuthReady(true);
      });

    // Pick up newly published quizzes when the student comes back to the app.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && uid.current) void refreshQuizzes();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      alive.current = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  /** Show a loading screen briefly, then run the next step. */
  const withLoader = (variant: LoaderVariant, label: string, next: () => void, ms = 1200) => {
    setLoader({ variant, label });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      next();
      setLoader(null);
    }, ms);
  };

  // ---- Auth actions (backend when configured, local preview otherwise) ----

  const handleSignup = async (a: Account, password: string): Promise<string | void> => {
    if (!cloudEnabled) {
      await sleep(700);
      saveAccount(a);
      setAccount(a);
      setVerifyEmail(a.email);
      setAuthView('verify');
      return;
    }
    const r = await cloud.signUp(a.email, password, a.name, a.phone);
    if (r.error) return r.error;
    if (r.needsVerification) {
      setVerifyEmail(a.email);
      setAuthView('verify');
    }
  };

  const handleSignin = async (email: string, password: string): Promise<string | void> => {
    if (!cloudEnabled) {
      await sleep(700);
      if (!account || account.email !== email) return 'No account with that email on this device. Please sign up first.';
      withLoader('word', 'Almost There...', () => {
        saveSignedIn(true);
        setSignedIn(true);
        go('/');
      });
      return;
    }
    const problem = await cloud.signIn(email, password);
    if (problem) return problem;
    go('/');
  };

  const handleForgot = async (email: string): Promise<string> => {
    if (!cloudEnabled) return 'Password reset is not available yet';
    const problem = await cloud.sendPasswordReset(email);
    return problem ?? 'Reset link sent. Check your email.';
  };

  const handleGoogle = async (): Promise<string | void> => {
    if (!cloudEnabled) return 'Google sign-in is a preview only';
    return cloud.signInWithGoogle();
  };

  const handleLogout = () => {
    if (cloudEnabled) {
      void cloud.signOut();
      return;
    }
    saveSignedIn(false);
    setSignedIn(false);
    setAuthView('signin');
  };

  const handleSaveAccount = async (a: Account) => {
    const prev = account;
    saveAccount(a);
    setAccount(a);
    const id = uid.current;
    if (!cloudEnabled || !id) return;

    const patch: Parameters<typeof cloud.updateProfile>[1] = {};
    if (!prev || a.name !== prev.name) patch.full_name = a.name;
    if (a.phone !== prev?.phone) patch.phone = a.phone ?? null;
    if (a.avatar !== prev?.avatar) {
      if (a.avatar?.startsWith('data:')) {
        try {
          const blob = await (await fetch(a.avatar)).blob();
          const url = await cloud.uploadAvatar(id, blob);
          patch.avatar_url = url;
          const withUrl = { ...a, avatar: url };
          saveAccount(withUrl);
          setAccount(withUrl);
        } catch {
          showNotice('Photo saved on this phone only. It could not be uploaded.');
        }
      } else {
        patch.avatar_url = a.avatar ?? null;
      }
    }
    if (Object.keys(patch).length > 0) {
      const problem = await cloud.updateProfile(id, patch);
      if (problem) showNotice(problem);
    }
  };

  const handleProfileDone = (p: ProfileData) => {
    saveProfile(p);
    const id = uid.current;
    if (cloudEnabled && id) {
      void cloud.updateProfile(id, { level: p.level, opt_set: p.set }).then((problem) => {
        if (problem) showNotice(problem);
      });
    }
  };

  const handleQuizFinish = (quizId: string, score: number, total: number) => {
    const next = saveResult(quizId, score, total);
    setResults(next);
    const id = uid.current;
    if (cloudEnabled && id) {
      cloud.upsertResult(id, quizId, next[quizId]).catch(() => showNotice('Score saved on this phone. It will sync later.'));
    }
  };

  // ---- Screens ----

  if (booting || !authReady) return <BootLoader />;
  if (loader) return <Loader variant={loader.variant} label={loader.label} />;
  if (syncing) return <Loader variant='word' label='Almost There...' />;

  if (cloudEnabled && recovery) {
    return (
      <ResetPassword
        onCancel={() => setRecovery(false)}
        onSubmit={async (password) => {
          const problem = await cloud.updatePassword(password);
          if (!problem) setRecovery(false);
          return problem;
        }}
      />
    );
  }

  if (!signedIn || !account) {
    if (authView === 'signup' || authView === 'signin') {
      return (
        <Auth
          key={authView}
          mode={authView}
          account={account}
          notice={notice}
          onBack={() => setAuthView('splash')}
          onSwitch={() => setAuthView(authView === 'signup' ? 'signin' : 'signup')}
          onSignup={handleSignup}
          onSignin={handleSignin}
          onForgot={handleForgot}
          onGoogle={handleGoogle}
        />
      );
    }
    if (authView === 'verify' && verifyEmail) {
      return (
        <VerifyEmail
          email={verifyEmail}
          preview={!cloudEnabled}
          onBack={() => setAuthView('signup')}
          onResend={() => (cloudEnabled ? cloud.resendVerification(verifyEmail) : Promise.resolve(undefined))}
          onVerified={() =>
            withLoader('ring', 'Setting up your account...', () => {
              saveSignedIn(true);
              setSignedIn(true);
              go('/');
            })
          }
        />
      );
    }
    return <Splash onStart={() => setAuthView('signup')} onSignIn={() => setAuthView('signin')} />;
  }

  if (!introSeen) {
    return (
      <Intro
        onDone={() => {
          saveIntroSeen();
          setIntroSeen(true);
        }}
      />
    );
  }

  if (!profile || editing) {
    return (
      <Onboarding
        initial={profile}
        onCancel={profile ? () => setEditing(false) : undefined}
        onDone={(p) => {
          handleProfileDone(p);
          if (profile) {
            setProfile(p);
            setEditing(false);
          } else {
            withLoader('eye', 'Preparing Your Space...', () => setProfile(p));
          }
        }}
      />
    );
  }

  const parts = path.split('/').filter(Boolean);
  const section = parts[0] ?? '';
  const arg = parts[1] ? safeDecode(parts[1]) : '';

  let screen: ReactNode;
  if (section === 'courses' && arg) {
    screen = <CourseDetail code={arg} results={results} go={go} />;
  } else if (section === 'topic' && arg) {
    screen = <TopicReader key={arg} id={arg} go={go} />;
  } else if (section === 'courses') {
    screen = <Courses level={profile.level} results={results} go={go} />;
  } else if (section === 'quizzes') {
    screen = <Quizzes results={results} go={go} />;
  } else if (section === 'quiz' && arg) {
    screen = <QuizRunner key={arg} quizId={arg} go={go} onFinish={handleQuizFinish} />;
  } else if (section === 'stats') {
    screen = <Stats results={results} go={go} />;
  } else if (section === 'tutor') {
    screen = <Tutor go={go} />;
  } else if (section === 'profile') {
    screen = (
      <Profile
        account={account}
        profile={profile}
        results={results}
        onSaveAccount={(a) => void handleSaveAccount(a)}
        onEditAcademic={() => setEditing(true)}
        onLogout={handleLogout}
      />
    );
  } else {
    screen = <Home profile={profile} account={account} results={results} go={go} />;
  }

  const tab =
    section === 'courses' || section === 'topic'
      ? 'courses'
      : section === 'quizzes' || section === 'quiz'
        ? 'quizzes'
        : section === 'profile'
          ? 'profile'
          : section === 'stats'
            ? 'stats'
            : 'home';

  const routeKey = section + '/' + arg;

  return (
    <>
      <main key={routeKey} className='route'>
        {screen}
      </main>
      <nav className='tabbar'>
        <button className={'tab' + (tab === 'home' ? ' on' : '')} onClick={() => go('/')}>
          <HomeIcon size={22} />
          <span>Home</span>
        </button>
        <button className={'tab' + (tab === 'courses' ? ' on' : '')} onClick={() => go('/courses')}>
          <BookOpen size={22} />
          <span>Courses</span>
        </button>
        <button className={'tab' + (tab === 'quizzes' ? ' on' : '')} onClick={() => go('/quizzes')}>
          <Trophy size={22} />
          <span>Quizzes</span>
        </button>
        <button className={'tab' + (tab === 'stats' ? ' on' : '')} onClick={() => go('/stats')}>
          <Activity size={22} />
          <span>Stats</span>
        </button>
        <button className={'tab' + (tab === 'profile' ? ' on' : '')} onClick={() => go('/profile')}>
          <User size={22} />
          <span>Profile</span>
        </button>
      </nav>
      <div className={'toast' + (notice ? ' show' : '')} role='status'>
        {notice}
      </div>
    </>
  );
}
