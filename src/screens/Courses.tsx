import { useRef, useState } from 'react';
import { ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { COURSES_BY_LEVEL, LEVELS, groupNames } from '../data/courses';
import { quizzesForCourse } from '../data/quizzes';
import type { Results } from '../types';
import { percent } from '../storage';
import { art } from '../art';
import Logo from '../components/Logo';
import { CourseTile } from '../visuals';

interface Props {
  level: number;
  results: Results;
  go: (to: string) => void;
}

function courseProgress(code: string, results: Results): number {
  const quizzes = quizzesForCourse(code);
  if (quizzes.length === 0) return 0;
  const sum = quizzes.reduce((s, q) => s + (results[q.id] ? percent(results[q.id]) : 0), 0);
  return Math.round(sum / quizzes.length);
}

export default function Courses({ level, results, go }: Props) {
  const [viewLevel, setViewLevel] = useState(level);
  const [query, setQuery] = useState('');
  const [onlyQuizzes, setOnlyQuizzes] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const all = COURSES_BY_LEVEL[viewLevel] ?? [];
  const q = query.trim().toLowerCase();
  const filtered = all.filter(
    (c) => (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) && (!onlyQuizzes || quizzesForCourse(c.code).length > 0),
  );
  const groups = groupNames().map((name) => ({
    name,
    items: filtered.filter((c) => c.group === name).sort((a, b) => a.code.localeCompare(b.code)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className='screen'>
      <section className='app-hero page-hero'>
        <div className='hero-row'>
          <Logo />
          <button className='ghost-icon' onClick={() => searchRef.current?.focus()} aria-label='Search courses'>
            <Search size={22} />
          </button>
        </div>
        <img className='hero-art side-art' src={art('courses-art')} alt='' />
        <div className='hero-copy'>
          <h1 className='hero-title'>Courses</h1>
          <p className='hero-text'>
            Explore well-structured courses
            <br />
            for your Optometry journey.
          </p>
        </div>
      </section>

      <div className='screen-body'>
        <div className='chips level-chips'>
          {LEVELS.map((l) => (
            <button key={l} className={'chip' + (l === viewLevel ? ' on' : '')} onClick={() => setViewLevel(l)}>
              {l}L
            </button>
          ))}
        </div>

        <div className='search-row'>
          <label className='search'>
            <Search size={18} />
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search by code or title...' />
          </label>
          <button
            className={'filter-btn' + (onlyQuizzes ? ' on' : '')}
            onClick={() => setOnlyQuizzes(!onlyQuizzes)}
            aria-pressed={onlyQuizzes}
            aria-label='Only show courses with quizzes'
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        {onlyQuizzes && <p className='filter-note'>Showing only courses that have quizzes</p>}

        {all.length === 0 && (
          <div className='empty-card'>
            <h3>{viewLevel} Level courses are coming soon</h3>
            <p>Only 100 Level is set up for now.</p>
          </div>
        )}

        {all.length > 0 && groups.length === 0 && <p className='empty'>No courses match.</p>}

        {groups.map((g) => (
          <section key={g.name}>
            <h2 className='group-title'>{g.name}</h2>
            <div className='list'>
              {g.items.map((c) => {
                const count = quizzesForCourse(c.code).length;
                return (
                  <button key={c.code} className='crow' onClick={() => go('/courses/' + encodeURIComponent(c.code))}>
                    <span className='ctile'>
                      <CourseTile code={c.code} />
                    </span>
                    <span className='cmain'>
                      <span className='ccode'>
                        {c.code}
                        {!c.verified && <em className='badge-mint'>To Confirm</em>}
                      </span>
                      <span className='ctitle'>{c.title}</span>
                      <span className='cmeta'>
                        {count} {count === 1 ? 'Quiz' : 'Quizzes'} &bull; {courseProgress(c.code, results)}% Complete
                      </span>
                    </span>
                    <ChevronRight size={20} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
