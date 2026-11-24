import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, BookOpen, Home as HomeIcon, Trophy, User } from 'lucide-react';
import { useHashRoute } from './useHashRoute';
import {
  loadAccount,
  loadIntroSeen,
  loadProfile,
  loadResults,
  loadSignedIn,
  saveAccount,
  saveIntroSeen,
  saveProfile,
  saveResult,
  saveSignedIn,
} from './storage';
import type { Account, Profile as ProfileData, Results } from './types';
import Loader from './components/Loader';
import type { LoaderVariant } from './components/Loader';
import Splash from './screens/Splash';
import Auth from './screens/Auth';
import VerifyEmail from './screens/VerifyEmail';
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

export default function AppShell() {
  const { path, go } = useHashRoute();
  const [account, setAccount] = useState<Account | null>(() => loadAccount());
  const [signedIn, setSignedIn] = useState<boolean>(() => loadSignedIn() && loadAccount() !== null);
  const [authView, setAuthView] = useState<AuthView>(() => (loadAccount() ? 'signin' : 'splash'));
  const [introSeen, setIntroSeen] = useState<boolean>(() => loadIntroSeen());
  const [profile, setProfile] = useState<ProfileData | null>(() => loadProfile());
  const [results, setResults] = useState<Results>(() => loadResults());
  const [editing, setEditing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [loader, setLoader] = useState<{ variant: LoaderVariant; label: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 1300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Show a loading screen briefly, then run the next step. */
  const withLoader = (variant: LoaderVariant, label: string, next: () => void, ms = 1200) => {
    setLoader({ variant, label });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      next();
      setLoader(null);
    }, ms);
  };

  if (booting) return <Loader variant='ring' label='App Loading...' />;
  if (loader) return <Loader variant={loader.variant} label={loader.label} />;

  if (!signedIn || !account) {
    if (authView === 'signup' || authView === 'signin') {
      return (
        <Auth
          key={authView}
          mode={authView}
          account={account}
          onBack={() => setAuthView('splash')}
          onSwitch={() => setAuthView(authView === 'signup' ? 'signin' : 'signup')}
          onSignup={(a) => {
            saveAccount(a);
            setAccount(a);
            setAuthView('verify');
          }}
          onSignin={() =>
            withLoader('word', 'Almost There...', () => {
              saveSignedIn(true);
              setSignedIn(true);
              go('/');
            })
          }
        />
      );
    }
    if (authView === 'verify' && account) {
      return (
        <VerifyEmail
          email={account.email}
          onBack={() => setAuthView('signup')}
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
          saveProfile(p);
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
  } else if (section === 'courses') {
    screen = <Courses level={profile.level} results={results} go={go} />;
  } else if (section === 'quizzes') {
    screen = <Quizzes results={results} go={go} />;
  } else if (section === 'quiz' && arg) {
    screen = (
      <QuizRunner
        key={arg}
        quizId={arg}
        go={go}
        onFinish={(id, score, total) => setResults(saveResult(id, score, total))}
      />
    );
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
        onSaveAccount={(a) => {
          saveAccount(a);
          setAccount(a);
        }}
        onEditAcademic={() => setEditing(true)}
        onLogout={() => {
          saveSignedIn(false);
          setSignedIn(false);
          setAuthView('signin');
        }}
      />
    );
  } else {
    screen = <Home profile={profile} account={account} results={results} go={go} />;
  }

  const tab =
    section === 'courses'
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
    </>
  );
}
