export interface Course {
  code: string;
  title: string;
  group: string;
  semester?: 1 | 2;
  verified: boolean;
}

export interface CourseRow extends Course {
  level: number;
}

export interface Topic {
  id: string;
  courseCode: string;
  position: number;
  title: string;
  body: string;
}

export interface Question {
  text: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseCode: string;
  title: string;
  questions: Question[];
}

export interface Profile {
  level: number;
  set: number;
}

export interface Result {
  best: number;
  last: number;
  total: number;
  attempts: number;
}

export type Results = Record<string, Result>;

export interface Account {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type Theme = 'light' | 'dark';
