import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, GraduationCap, Search, X } from 'lucide-react';
import { LEVELS, SETS } from '../data/courses';
import type { Profile } from '../types';
import Logo from '../components/Logo';

interface Props {
  initial: Profile | null;
  onDone: (p: Profile) => void;
  onCancel?: () => void;
}

const QUICK = 6;

/** Step 1: find your set with a search bar. Step 2: pick your level. */
export default function Onboarding({ initial, onDone, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [set, setSet] = useState<number | null>(initial ? initial.set : null);
  const [level, setLevel] = useState<number | null>(initial ? initial.level : null);
  const [query, setQuery] = useState('');

  const typed = query.trim();
  const suggestions = useMemo(() => {
    if (!typed) return SETS.slice(0, QUICK);
    const q = typed.toLowerCase().replace(/opt/g, '').replace(/\s+/g, '');
    if (!q) return SETS.slice(0, QUICK);
    return SETS.filter((s) => String(s).includes(q));
  }, [typed]);

  const pick = (s: number) => {
    setSet(s);
    setQuery('');
  };

  return (
    <div className='welcome screen-in'>
      <div className='welcome-hero'>
        <Logo variant='full' />
        <h1>Study smarter. See further.</h1>
        <p>Courses and quizzes for Uniben Optometry students.</p>
      </div>

      <div className='welcome-body' key={step}>
        <div className='steps' role='progressbar' aria-valuemin={1} aria-valuemax={2} aria-valuenow={step} aria-label={'Step ' + step + ' of 2'}>
          <div className='steps-bars'>
            <i className='on' />
            <i className={step === 2 ? 'on' : ''} />
          </div>
          <span>Step {step} of 2</span>
        </div>

        {step === 1 ? (
          <div className='step-in'>
            <h2 className='step-title'>What is your set?</h2>
            <label className={'set-search' + (set !== null ? ' chosen' : '')}>
              <Search size={18} />
              <input
                type='text'
                inputMode='search'
                placeholder='Type your set, e.g. OPT 260'
                value={set !== null ? 'OPT ' + set : query}
                onChange={(e) => {
                  setSet(null);
                  setQuery(e.target.value);
                }}
                autoComplete='off'
                autoCorrect='off'
                spellCheck={false}
                aria-label='Search your set'
              />
              {(set !== null || query) && (
                <button
                  type='button'
                  className='set-clear'
                  onClick={() => {
                    setSet(null);
                    setQuery('');
                  }}
                  aria-label='Clear'
                >
                  <X size={16} />
                </button>
              )}
            </label>

            {set === null && (
              <>
                <p className='sug-label'>{typed ? 'Matching sets' : 'Suggested sets'}</p>
                {suggestions.length ? (
                  <ul className='sug-list'>
                    {suggestions.map((s, i) => (
                      <li key={s + ':' + typed} style={{ ['--i' as string]: i }}>
                        <button type='button' className='sug' onClick={() => pick(s)}>
                          <span className='sug-ico'>
                            <GraduationCap size={18} />
                          </span>
                          <span>OPT {s}</span>
                          <ArrowRight size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='sug-empty'>No set found. Check the number and try again.</p>
                )}
              </>
            )}
            {set !== null && (
              <p className='sug-picked'>
                <Check size={16} /> OPT {set} selected
              </p>
            )}
          </div>
        ) : (
          <div className='step-in'>
            <h2 className='step-title'>What is your level?</h2>
            <div className='choice-grid'>
              {LEVELS.map((l) => (
                <button key={l} className={'choice' + (level === l ? ' on' : '')} aria-pressed={level === l} onClick={() => setLevel(l)}>
                  {l} Level
                </button>
              ))}
            </div>
          </div>
        )}

        <div className='actions'>
          {step === 1 && onCancel && (
            <button className='btn btn-ghost' onClick={onCancel}>
              Cancel
            </button>
          )}
          {step === 2 && (
            <button className='btn btn-ghost back-btn' onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step === 1 ? (
            <button className='btn btn-primary' disabled={set === null} onClick={() => setStep(2)}>
              Continue
            </button>
          ) : (
            <button
              className='btn btn-primary'
              disabled={level === null || set === null}
              onClick={() => {
                if (level !== null && set !== null) onDone({ level, set });
              }}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
