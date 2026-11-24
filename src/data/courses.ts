import type { Course } from '../types';

export const LEVELS: number[] = [100, 200, 300, 400, 500, 600];

// Sets run in tens: OPT 190, OPT 200 ... OPT 300
export const SETS: number[] = Array.from({ length: 12 }, (_, i) => 190 + i * 10);

export const GROUPS: string[] = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Zoology', 'General Studies', 'Computing'];

// verified: true  = listed on the official Uniben portal (waeup.uniben.edu)
// verified: false = taken from your own list, still to be confirmed
const official = (code: string, title: string, group: string, semester: 1 | 2): Course => ({ code, title, group, semester, verified: true });
const listed = (code: string, title: string, group: string): Course => ({ code, title, group, verified: false });

const LEVEL_100: Course[] = [
  listed('MTH 101', 'Elementary Mathematics I', 'Mathematics'),
  listed('MTH 102', 'Elementary Mathematics II', 'Mathematics'),
  listed('MTH 103', 'Mathematics 103', 'Mathematics'),
  listed('MTH 104', 'Mathematics 104', 'Mathematics'),

  listed('PHY 101', 'General Physics I', 'Physics'),
  listed('PHY 102', 'General Physics II', 'Physics'),
  listed('PHY 103', 'Physics 103', 'Physics'),
  listed('PHY 104', 'Physics 104', 'Physics'),
  listed('PHY 107', 'General Physics Practical I', 'Physics'),
  official('PHY 109', 'Practical Physics', 'Physics', 1),
  official('PHY 111', 'Mechanics, Thermal Physics and Properties of Matter', 'Physics', 1),
  official('PHY 113', 'Vibrations, Waves and Optics', 'Physics', 1),
  official('PHY 124', 'Electromagnetism and Modern Physics', 'Physics', 2),

  listed('CHM 101', 'General Chemistry I', 'Chemistry'),
  listed('CHM 102', 'General Chemistry II', 'Chemistry'),
  listed('CHM 103', 'Chemistry 103', 'Chemistry'),
  listed('CHM 104', 'Chemistry 104', 'Chemistry'),
  listed('CHM 107', 'General Chemistry Practical I', 'Chemistry'),
  official('CHM 111', 'General Chemistry I', 'Chemistry', 1),
  official('CHM 113', 'Organic Chemistry I', 'Chemistry', 1),
  official('CHM 122', 'General Chemistry II', 'Chemistry', 2),
  official('CHM 124', 'Organic Chemistry II', 'Chemistry', 2),

  listed('BIO 101', 'General Biology I', 'Biology'),
  listed('BIO 102', 'General Biology II', 'Biology'),
  listed('BIO 103', 'Biology 103', 'Biology'),
  listed('BIO 104', 'Biology 104', 'Biology'),
  listed('BIO 107', 'General Biology Practical I', 'Biology'),
  official('BOT 111', 'Diversity of Plants', 'Biology', 1),
  official('BOT 122', 'Plant Form and Function', 'Biology', 2),

  listed('ZOO 101', 'The Mammalian Body', 'Zoology'),
  listed('ZOO 102', 'Animal Diversity', 'Zoology'),
  listed('ZOO 103', 'Zoology 103', 'Zoology'),
  listed('ZOO 104', 'Zoology 104', 'Zoology'),
  listed('ZOO 107', 'Zoology Practical', 'Zoology'),
  official('ZOO 111', 'Introductory Zoology', 'Zoology', 1),
  official('ZOO 122', 'Functional Zoology', 'Zoology', 2),

  official('GST 111', 'Communication in English', 'General Studies', 1),
  official('GST 112', 'Nigerian Peoples and Culture', 'General Studies', 1),
  official('GST 121', 'Peace Studies and Conflict Resolution', 'General Studies', 2),
  official('GST 122', 'Nigerian Peoples and Culture', 'General Studies', 2),
  official('GST 123', 'History and Philosophy of Science and Technology', 'General Studies', 2),

  official('CSC 110', 'Introduction to Computing', 'Computing', 1),
];

// Add 200 to 600 Level courses here later, in the same format.
export const COURSES_BY_LEVEL: Record<number, Course[]> = {
  100: LEVEL_100,
  200: [],
  300: [],
  400: [],
  500: [],
  600: [],
};

export function findCourse(code: string): Course | undefined {
  for (const level of LEVELS) {
    const hit = (COURSES_BY_LEVEL[level] ?? []).find((c) => c.code === code);
    if (hit) return hit;
  }
  return undefined;
}
