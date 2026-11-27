import type { Quiz } from '../types';
import { cloudEnabled } from '../config';
import { loadQuizCache } from '../storage';

// With the backend connected, quizzes are managed in the OPTIQ admin dashboard and this list is
// replaced by the published quizzes when the app starts. The quizzes below are the starting
// content and the fallback when the phone is offline and has never loaded the online list.
//
// HOW TO ADD A BUNDLED QUIZ (only needed without the backend)
// 1. Copy one of the objects below and paste it at the end of the list.
// 2. courseCode must match a course code exactly, for example 'MTH 101'.
// 3. answer is the position of the correct option, counting from 0.
// 4. explanation is optional and shows after a question is answered.
export const QUIZZES: Quiz[] = [
  {
    id: 'mth101-algebra-basics',
    courseCode: 'MTH 101',
    title: 'Sample: Algebra basics',
    questions: [
      { text: 'Simplify 2³ × 2²', options: ['10', '32', '64', '25'], answer: 1, explanation: 'Add the powers: 2⁵ = 32.' },
      { text: 'Solve for x: 3x + 5 = 20', options: ['3', '5', '7', '15'], answer: 1, explanation: 'Subtract 5 to get 3x = 15, then divide by 3.' },
      { text: 'The solutions of x² − 5x + 6 = 0 are', options: ['1 and 6', '2 and 3', '−2 and −3', '5 and 1'], answer: 1, explanation: 'It factorises as (x − 2)(x − 3).' },
    ],
  },
  {
    id: 'chm101-atoms-basics',
    courseCode: 'CHM 101',
    title: 'Sample: Atoms and pH',
    questions: [
      { text: 'What is the atomic number of carbon?', options: ['4', '6', '8', '12'], answer: 1 },
      { text: 'Which particle carries a negative charge?', options: ['Proton', 'Neutron', 'Electron', 'Nucleus'], answer: 2 },
      { text: 'The pH of a neutral solution at 25 °C is', options: ['0', '7', '10', '14'], answer: 1 },
    ],
  },
  {
    id: 'bio101-cell-basics',
    courseCode: 'BIO 101',
    title: 'Sample: The cell',
    questions: [
      { text: 'The powerhouse of the cell is the', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Vacuole'], answer: 1 },
      { text: 'Which organelle carries out photosynthesis?', options: ['Mitochondrion', 'Ribosome', 'Chloroplast', 'Lysosome'], answer: 2 },
      { text: 'The basic unit of life is the', options: ['Tissue', 'Organ', 'Cell', 'Organism'], answer: 2 },
    ],
  },
];

/** Replace the quiz list in place. Screens read this array whenever they render. */
export function setQuizzes(list: Quiz[]): void {
  QUIZZES.splice(0, QUIZZES.length, ...list);
}

// Show the last list downloaded from the backend straight away, even before the phone is online.
if (cloudEnabled) {
  const cached = loadQuizCache();
  if (cached) setQuizzes(cached);
}

export function quizzesForCourse(code: string): Quiz[] {
  return QUIZZES.filter((q) => q.courseCode === code);
}
