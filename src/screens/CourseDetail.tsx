import { ArrowLeft } from 'lucide-react';
import { findCourse } from '../data/courses';
import { quizzesForCourse } from '../data/quizzes';
import type { Results } from '../types';
import QuizCard from '../components/QuizCard';

interface Props {
  code: string;
  results: Results;
  go: (to: string) => void;
}

export default function CourseDetail({ code, results, go }: Props) {
  const course = findCourse(code);
  const quizzes = quizzesForCourse(code);

  return (
    <div className='page'>
      <button className='back' onClick={() => go('/courses')}>
        <ArrowLeft size={18} /> Courses
      </button>
      <section className='hero hero-sm'>
        <p className='eyebrow'>{course ? course.group : 'Course'}</p>
        <h1>{code}</h1>
        <p className='hero-sub'>{course ? course.title : 'This course is not in the list.'}</p>
      </section>

      <h2 className='section-title'>Quizzes</h2>
      {quizzes.length === 0 ? (
        <div className='empty-card'>
          <h3>No quizzes yet</h3>
          <p>Quizzes for {code} will show up here once they are added.</p>
        </div>
      ) : (
        <div className='list'>
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} result={results[quiz.id]} onOpen={() => go('/quiz/' + encodeURIComponent(quiz.id))} />
          ))}
        </div>
      )}
    </div>
  );
}
