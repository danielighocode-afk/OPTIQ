import { ChevronRight } from 'lucide-react';
import type { Quiz, Result } from '../types';
import { percent } from '../storage';
import { QuizThumb } from '../visuals';

interface Props {
  quiz: Quiz;
  result?: Result;
  onOpen: () => void;
}

export default function QuizCard({ quiz, result, onOpen }: Props) {
  return (
    <button className='qcard' onClick={onOpen}>
      <span className='qthumb'>
        <QuizThumb code={quiz.courseCode} />
      </span>
      <span className='qmain'>
        <span className='qcode'>{quiz.courseCode}</span>
        <span className='qtitle'>{quiz.title}</span>
        <span className='qmeta'>
          <i className='qmark'>?</i>
          {quiz.questions.length} Questions &bull; {result ? 'Best ' + percent(result) + '%' : 'Not taken yet'}
        </span>
      </span>
      <span className='qgo'>
        <ChevronRight size={20} />
      </span>
    </button>
  );
}
