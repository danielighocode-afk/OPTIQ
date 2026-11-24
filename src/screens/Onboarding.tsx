import { useState } from 'react';
import { LEVELS, SETS } from '../data/courses';
import type { Profile } from '../types';
import Logo from '../components/Logo';

interface Props {
  initial: Profile | null;
  onDone: (p: Profile) => void;
  onCancel?: () => void;
}

export default function Onboarding({ initial, onDone, onCancel }: Props) {
  const [level, setLevel] = useState<number | null>(initial ? initial.level : null);
  const [set, setSet] = useState<number | null>(initial ? initial.set : null);
  const ready = level !== null && set !== null;

  return (
    <div className='welcome screen-in'>
      <div className='welcome-hero'>
        <Logo variant='full' />
        <h1>Study smarter. See further.</h1>
        <p>Courses and quizzes for Uniben Optometry students.</p>
      </div>
      <div className='welcome-body'>
        <h2>Your level</h2>
        <div className='choice-grid'>
          {LEVELS.map((l) => (
            <button key={l} className={'choice' + (level === l ? ' on' : '')} aria-pressed={level === l} onClick={() => setLevel(l)}>
              {l} Level
            </button>
          ))}
        </div>
        <h2>Your set</h2>
        <div className='choice-grid sets'>
          {SETS.map((s) => (
            <button key={s} className={'choice' + (set === s ? ' on' : '')} aria-pressed={set === s} onClick={() => setSet(s)}>
              OPT {s}
            </button>
          ))}
        </div>
        <div className='actions'>
          {onCancel && (
            <button className='btn btn-ghost' onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className='btn btn-primary'
            disabled={!ready}
            onClick={() => {
              if (level !== null && set !== null) onDone({ level, set });
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
