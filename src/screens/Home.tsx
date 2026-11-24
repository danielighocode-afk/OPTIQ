import { BarChart3Icon } from './homeIcons';
import { Bot, ChevronRight, ClipboardList, BookOpen, GraduationCap, Check, Play, Star, ArrowRight } from 'lucide-react';
import { COURSES_BY_LEVEL } from '../data/courses';
import { QUIZZES } from '../data/quizzes';
import type { Account, Profile, Results } from '../types';
import { percent } from '../storage';
import { art } from '../art';
import Logo from '../components/Logo';
import { StudentAvatar } from '../components/Illustrations';

interface Props {
  profile: Profile;
  account: Account;
  results: Results;
  go: (to: string) => void;
}

export default function Home({ profile, account, results, go }: Props) {
  const courseCount = (COURSES_BY_LEVEL[profile.level] ?? []).length;
  const taken = Object.values(results);
  const average = taken.length ? Math.round(taken.reduce((sum, r) => sum + percent(r), 0) / taken.length) : 0;
  const next = QUIZZES.find((q) => !results[q.id]) ?? QUIZZES[0];
  const first = account.name.trim().split(' ')[0];

  return (
    <div className='screen'>
      <div className='hero-wrap'>
      <section className='app-hero home-hero'>
        <div className='hero-row'>
          <Logo />
          <button className='avatar-btn' onClick={() => go('/profile')} aria-label='Open profile'>
            {account.avatar ? <img src={account.avatar} alt='' /> : <StudentAvatar size={40} />}
          </button>
        </div>
        <div className='home-art-wrap' aria-hidden='true'>
          <img className='hero-art home-art' src={art('home-art')} alt='' />
          <svg className='eye-blink' viewBox='0 0 205 225'>
            <defs>
              <linearGradient id='lidGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0' stopColor='#3d96ec' />
                <stop offset='1' stopColor='#1b5fcc' />
              </linearGradient>
            </defs>
            <path
              className='lid'
              fill='url(#lidGrad)'
              stroke='rgba(9,38,120,.55)'
              strokeWidth='.8'
              d='M0 115 C14 109 24 106 36 107 C56 108 72 116 86 130 C99 143 109 154 117 165 C100 165 88 167 72 168 C54 168 36 160 22 150 C12 144 5 140 0 137 Z'
            />
          </svg>
        </div>
        <div className='hero-copy'>
          <p className='hello'>Welcome Back,</p>
          <h1 className='hello-name'>
            {first} <span className='wave-hand'>👋</span>
          </h1>
          <p className='hello-sub'>Keep learning. Keep growing.</p>
        </div>
      </section>
      <div className='level-pill'>
        <GraduationCap size={26} />
        <span>
          OPT {profile.set} · {profile.level} Level
        </span>
      </div>
      </div>

      <div className='screen-body'>
        <section className='stat-cards stagger'>
          <div className='stat-card'>
            <BookOpen size={26} />
            <strong>{courseCount}</strong>
            <span>Courses</span>
          </div>
          <div className='stat-card'>
            <ClipboardList size={26} />
            <strong>{QUIZZES.length}</strong>
            <span>Quizzes</span>
          </div>
          <div className='stat-card'>
            <span className='ok-dot'>
              <Check size={16} />
            </span>
            <strong>{taken.length}</strong>
            <span>Taken</span>
          </div>
          <div className='stat-card'>
            <Star size={26} />
            <strong>{taken.length ? average + '%' : '-'}</strong>
            <span>Average</span>
          </div>
        </section>

        <button className='btn btn-continue btn-lg' onClick={() => (next ? go('/quiz/' + encodeURIComponent(next.id)) : go('/courses'))}>
          <Play size={18} fill='currentColor' /> Continue Learning <ArrowRight size={18} />
        </button>

        <h2 className='qa-title'>Quick Actions</h2>
        <div className='qa-grid'>
          <button className='qa' onClick={() => go('/quizzes')}>
            <span className='qa-ico'>
              <ClipboardList size={24} />
            </span>
            <span>Take a Quiz</span>
            <ChevronRight size={18} />
          </button>
          <button className='qa' onClick={() => go('/courses')}>
            <span className='qa-ico'>
              <BookOpen size={24} />
            </span>
            <span>Browse Courses</span>
          </button>
          <button className='qa' onClick={() => go('/stats')}>
            <span className='qa-ico'>
              <BarChart3Icon />
            </span>
            <span>View Progress</span>
            <ChevronRight size={18} />
          </button>
          <button className='qa' onClick={() => go('/tutor')}>
            <span className='qa-ico bot'>
              <Bot size={24} />
            </span>
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
