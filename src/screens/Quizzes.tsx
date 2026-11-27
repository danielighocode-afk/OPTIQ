import { useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { QUIZZES } from '../data/quizzes';
import type { Results } from '../types';
import { art } from '../art';
import Logo from '../components/Logo';
import QuizCard from '../components/QuizCard';
import { GroupIcon, SHORT_GROUP, groupOf } from '../visuals';

interface Props {
  results: Results;
  go: (to: string) => void;
}

export default function Quizzes({ results, go }: Props) {
  const [cat, setCat] = useState('All');
  const [query, setQuery] = useState('');
  const [notTaken, setNotTaken] = useState(false);

  const groups = Array.from(new Set(QUIZZES.map((q) => groupOf(q.courseCode))));
  const q = query.trim().toLowerCase();

  const visible = QUIZZES.filter(
    (quiz) =>
      (cat === 'All' || groupOf(quiz.courseCode) === cat) &&
      (!q || quiz.title.toLowerCase().includes(q) || quiz.courseCode.toLowerCase().includes(q)) &&
      (!notTaken || !results[quiz.id]),
  );
  const shownGroups = groups.filter((g) => visible.some((quiz) => groupOf(quiz.courseCode) === g));

  return (
    <div className='screen'>
      <section className='app-hero page-hero'>
        <div className='hero-row'>
          <Logo />
        </div>
        <img className='hero-art side-art quiz-art' src={art('quizzes-art')} alt='' />
        <div className='hero-copy'>
          <h1 className='hero-title'>Quizzes</h1>
          <p className='hero-text'>
            Test your knowledge
            <br />
            and track your progress.
          </p>
        </div>
      </section>

      <div className='screen-body'>
        <div className='chips level-chips'>
          {['All', ...groups].map((g) => (
            <button key={g} className={'chip' + (g === cat ? ' on' : '')} onClick={() => setCat(g)}>
              {SHORT_GROUP[g] ?? g}
            </button>
          ))}
        </div>

        <div className='search-row'>
          <label className='search'>
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search quizzes...' />
          </label>
          <button className={'filter-btn' + (notTaken ? ' on' : '')} onClick={() => setNotTaken(!notTaken)} aria-pressed={notTaken} aria-label='Only show quizzes not taken yet'>
            <SlidersHorizontal size={18} />
          </button>
        </div>
        {notTaken && <p className='filter-note'>Showing only quizzes you have not taken yet</p>}

        {QUIZZES.length === 0 && (
          <div className='empty-card'>
            <h3>No quizzes yet</h3>
            <p>Quizzes will appear here once they are added.</p>
          </div>
        )}
        {QUIZZES.length > 0 && visible.length === 0 && <p className='empty'>No quizzes match.</p>}

        {shownGroups.map((g) => (
          <section key={g}>
            <div className='qgroup-head'>
              <h2>
                <GroupIcon group={g} size={20} /> {g.toUpperCase()}
              </h2>
              {cat === 'All' && (
                <button className='link-btn' onClick={() => setCat(g)}>
                  View All <ArrowRight size={14} />
                </button>
              )}
            </div>
            <div className='list'>
              {visible
                .filter((quiz) => groupOf(quiz.courseCode) === g)
                .map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} result={results[quiz.id]} onOpen={() => go('/quiz/' + encodeURIComponent(quiz.id))} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
