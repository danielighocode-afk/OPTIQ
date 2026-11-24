import { Atom, BookOpen, Bug, Calculator, FlaskConical, Landmark, Leaf, Monitor, Sigma } from 'lucide-react';
import type { ReactNode } from 'react';
import { findCourse } from './data/courses';
import { art } from './art';

export const SHORT_GROUP: Record<string, string> = {
  Mathematics: 'Math',
  Physics: 'Phys',
  Chemistry: 'Chem',
  Biology: 'Bio',
  Zoology: 'Zoo',
  'General Studies': 'GST',
  Computing: 'Comp',
};

export function groupOf(code: string): string {
  return findCourse(code)?.group ?? 'General Studies';
}

export function GroupIcon({ group, size = 22 }: { group: string; size?: number }): ReactNode {
  switch (group) {
    case 'Mathematics':
      return <Sigma size={size} />;
    case 'Physics':
      return <Atom size={size} />;
    case 'Chemistry':
      return <FlaskConical size={size} />;
    case 'Biology':
      return <Leaf size={size} />;
    case 'Zoology':
      return <Bug size={size} />;
    case 'Computing':
      return <Monitor size={size} />;
    case 'General Studies':
      return <Landmark size={size} />;
    default:
      return <BookOpen size={size} />;
  }
}

const MATH_TILES: Record<string, string> = {
  'MTH 101': 't-calc',
  'MTH 102': 't-graph',
  'MTH 103': 't-pi',
  'MTH 104': 't-sigma',
};

/** Square thumbnail for a course: the designed tile where there is one, else an icon tile. */
export function CourseTile({ code }: { code: string }) {
  const tile = MATH_TILES[code];
  if (tile) return <img className='tile-img' src={art(tile)} alt='' />;
  return (
    <span className='tile-icon'>
      <GroupIcon group={groupOf(code)} size={26} />
    </span>
  );
}

const QUIZ_THUMBS: Record<string, string> = { Biology: 'leaf', Chemistry: 'molecule', Mathematics: 'pi' };

/** Thumbnail for a quiz: leaf, molecule or pi where the design has one, else an icon tile. */
export function QuizThumb({ code }: { code: string }) {
  const group = groupOf(code);
  const img = QUIZ_THUMBS[group];
  if (img) return <img className='thumb-img' src={art(img)} alt='' />;
  return (
    <span className='thumb-icon'>
      <GroupIcon group={group} size={32} />
    </span>
  );
}
