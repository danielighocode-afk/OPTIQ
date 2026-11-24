import { ClipboardList } from 'lucide-react';
import { QUIZZES } from '../data/quizzes';
import type { Results } from '../types';
import { percent } from '../storage';
import Logo from '../components/Logo';
import { GroupIcon, groupOf } from '../visuals';

interface Props {
  results: Results;
  go: (to: string) => void;
}

const R = 52;
const C = 2 * Math.PI * R;

export default function Stats({ results, go }: Props) {
  const taken = QUIZZES.filter((q) => results[q.id]);
  const pcts = taken.map((q) => percent(results[q.id]));
  const average = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
  const best = pcts.length ? Math.max(...pcts) : 0;
  const attempts = taken.reduce((s, q) => s + results[q.id].attempts, 0);
  const progress = QUIZZES.length ? Math.round((taken.length / QUIZZES.length) * 100) : 0;

  const subjects = Array.from(new Set(QUIZZES.map((q) => groupOf(q.courseCode)))).map((g) => {
    const inGroup = QUIZZES.filter((q) => groupOf(q.courseCode) === g);
    const done = inGroup.filter((q) => results[q.id]);
    const avg = done.length ? Math.round(done.reduce((s, q) => s + percent(results[q.id]), 0) / done.length) : 0;
    return { g, avg, done: done.length, total: inGroup.length };
  });

  return (
    <div className='screen'>
      <section className='app-hero page-hero short'>
        <div className='hero-row'>
          <Logo />
        </div>
        <div className='hero-copy'>
          <h1 className='hero-title'>Stats</h1>
          <p className='hero-text'>See how you are doing across your quizzes.</p>
        </div>
      </section>

      <div className='screen-body'>
        <section className='ring-card'>
          <div className='ring'>
            <svg viewBox='0 0 120 120' aria-hidden='true'>
              <circle cx='60' cy='60' r={R} className='ring-bg' />
              <circle cx='60' cy='60' r={R} className='ring-fg' style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress / 100) }} />
            </svg>
            <div className='ring-text'>
              <strong>{progress}%</strong>
              <span>Overall Progress</span>
            </div>
          </div>
          <div className='ring-facts'>
            <div>
              <strong>{taken.length}</strong>
              <span>Quizzes taken</span>
            </div>
            <div>
              <strong>{taken.length ? average + '%' : '-'}</strong>
              <span>Average score</span>
            </div>
            <div>
              <strong>{taken.length ? best + '%' : '-'}</strong>
              <span>Best score</span>
            </div>
            <div>
              <strong>{attempts}</strong>
              <span>Attempts</span>
            </div>
          </div>
        </section>

        {taken.length === 0 ? (
          <div className='empty-card'>
            <h3>No quiz results yet</h3>
            <p>Take a quiz and your scores will show up here.</p>
            <button className='btn btn-grad' style={{ marginTop: 14 }} onClick={() => go('/quizzes')}>
              <ClipboardList size={18} /> Take a quiz
            </button>
          </div>
        ) : (
          <>
            <h2 className='qa-title'>By Subject</h2>
            <div className='card-list subj'>
              {subjects.map((s) => (
                <div className='subj-row' key={s.g}>
                  <span className='p-ico'>
                    <GroupIcon group={s.g} size={20} />
                  </span>
                  <div className='subj-main'>
                    <div className='subj-top'>
                      <b>{s.g}</b>
                      <span>
                        {s.done}/{s.total} done &bull; {s.avg}%
                      </span>
                    </div>
                    <div className='bar'>
                      <i style={{ width: s.avg + '%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className='qa-title'>Quiz History</h2>
            <div className='card-list'>
              {taken.map((q) => {
                const r = results[q.id];
                return (
                  <button className='p-row' key={q.id} onClick={() => go('/quiz/' + encodeURIComponent(q.id))}>
                    <span className='p-text'>
                      <small>{q.courseCode}</small>
                      <b>{q.title}</b>
                      <small>
                        Last {r.total ? Math.round((r.last / r.total) * 100) : 0}% &bull; {r.attempts} {r.attempts === 1 ? 'attempt' : 'attempts'}
                      </small>
                    </span>
                    <span className='score-badge'>{percent(r)}%</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
