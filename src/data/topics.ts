import type { Topic } from '../types';
import { cloudEnabled } from '../config';
import { loadTopicCache } from '../storage';

// The notes. They are written in the OPTIQ admin dashboard and loaded when the app starts.
// With no connection the phone shows the last copy it downloaded.
export const TOPICS: Topic[] = [];

/** Replace the topic list in place. Screens read this array whenever they render. */
export function setTopics(list: Topic[]): void {
  TOPICS.splice(0, TOPICS.length, ...list);
}

if (cloudEnabled) {
  const cached = loadTopicCache();
  if (cached) setTopics(cached);
}

export function topicsForCourse(code: string): Topic[] {
  return TOPICS.filter((t) => t.courseCode === code).sort((a, b) => a.position - b.position);
}

export function findTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
