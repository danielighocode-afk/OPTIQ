import { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { QUIZZES } from '../data/quizzes';

interface Props {
  quizId: string;
  go: (to: string) => void;
  onFinish: (id: string, score: number, total: number) => void;
}

export default function QuizRunner({ quizId, go, onFinish }: Props) {
  // Keep the quiz as it was when the student started it, even if the list refreshes mid-quiz.
  const [quiz] = useState(() => QUIZZES.find((q) => q.id === quizId));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className='page'>
        <p className='empty'>That quiz could not be found.</p>
        <button className='btn btn-primary' onClick={() => go('/quizzes')}>
          Back to quizzes
        </button>
      </div>
    );
  }

  const total = quiz.questions.length;
  const score = answers.filter((a, i) => a === quiz.questions[i].answer).length;

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
  };

  const next = () => {
    if (picked === null) return;
    const updated = [...answers, picked];
    setAnswers(updated);
    if (index + 1 >= total) {
      const finalScore = updated.filter((a, i) => a === quiz.questions[i].answer).length;
      onFinish(quiz.id, finalScore, total);
      setDone(true);
    } else {
      setIndex(index + 1);
      setPicked(null);
    }
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    const message = pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort, keep going.' : 'Review the topic and try again.';
    return (
      <div className='page'>
        <section className='score-card'>
          <p className='eyebrow'>{quiz.courseCode} · {quiz.title}</p>
          <h1>You scored {score} / {total}</h1>
          <div className='score-pct'>{pct}%</div>
          <p>{message}</p>
        </section>

        <h2 className='section-title'>Review</h2>
        {quiz.questions.map((question, i) => {
          const right = answers[i] === question.answer;
          return (
            <div className='review' key={i}>
              <strong>{i + 1}. {question.text}</strong>
              <p className={right ? 'ok' : 'no'}>Your answer: {question.options[answers[i]]}</p>
              {!right && <p className='ok'>Correct answer: {question.options[question.answer]}</p>}
            </div>
          );
        })}

        <div className='stack'>
          <button className='btn btn-ghost' onClick={() => go('/quizzes')}>
            All quizzes
          </button>
          <button className='btn btn-primary' onClick={restart}>
            <RotateCcw size={18} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[index];
  const progress = ((index + (picked !== null ? 1 : 0)) / total) * 100;

  return (
    <div className='page'>
      <button className='back' onClick={() => go('/quizzes')}>
        <ArrowLeft size={18} /> Quizzes
      </button>
      <p className='q-count'>{quiz.courseCode} · Question {index + 1} of {total}</p>
      <div className='progress'>
        <i style={{ width: progress + '%' }} />
      </div>
      <h2 className='q-text'>{question.text}</h2>

      {question.options.map((option, i) => {
        let state = '';
        if (picked !== null) {
          if (i === question.answer) state = ' correct';
          else if (i === picked) state = ' wrong';
          else state = ' dim';
        }
        return (
          <button key={i} className={'option' + state} onClick={() => picked === null && setPicked(i)}>
            <span className='letter'>{String.fromCharCode(65 + i)}</span>
            <span>{option}</span>
          </button>
        );
      })}

      {picked !== null && question.explanation && <div className='explain'>{question.explanation}</div>}

      <button className='btn btn-primary' style={{ width: '100%' }} disabled={picked === null} onClick={next}>
        {index + 1 === total ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}
