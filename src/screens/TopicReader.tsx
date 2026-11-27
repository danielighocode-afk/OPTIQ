import { ArrowLeft, ArrowRight } from 'lucide-react';
import Markdown from '../markdown';
import { findCourse } from '../data/courses';
import { findTopic, topicsForCourse } from '../data/topics';

interface Props {
  id: string;
  go: (to: string) => void;
}

export default function TopicReader({ id, go }: Props) {
  const topic = findTopic(id);

  if (!topic) {
    return (
      <div className='page'>
        <button className='back' onClick={() => go('/courses')}>
          <ArrowLeft size={18} /> Courses
        </button>
        <div className='empty-card'>
          <h3>Topic not found</h3>
          <p>It may have been removed. Go back to the course and pick another one.</p>
        </div>
      </div>
    );
  }

  const course = findCourse(topic.courseCode);
  const siblings = topicsForCourse(topic.courseCode);
  const index = siblings.findIndex((t) => t.id === topic.id);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined;
  const open = (t: { id: string }) => go('/topic/' + encodeURIComponent(t.id));

  return (
    <div className='page'>
      <button className='back' onClick={() => go('/courses/' + encodeURIComponent(topic.courseCode))}>
        <ArrowLeft size={18} /> {topic.courseCode}
      </button>
      <article className='reader'>
        <p className='eyebrow'>
          {course ? course.title : topic.courseCode} &bull; Topic {index + 1} of {siblings.length}
        </p>
        <h1 className='reader-title'>{topic.title}</h1>
        <Markdown text={topic.body} />
      </article>
      <nav className='reader-nav' aria-label='Topics'>
        <button className='rnav' disabled={!prev} onClick={() => prev && open(prev)}>
          <ArrowLeft size={18} /> <span>Previous</span>
        </button>
        <button className='rnav next' disabled={!next} onClick={() => next && open(next)}>
          <span>Next</span> <ArrowRight size={18} />
        </button>
      </nav>
    </div>
  );
}
