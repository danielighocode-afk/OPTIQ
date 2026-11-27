// Checking whether a newer version of the app is available.
import { cloudEnabled } from './config';
import { supabase } from './supabase';

export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

export interface Release {
  version: string;
  minVersion: string;
  downloadUrl: string;
  notes: string;
}

const VERSION = /^[0-9]+(\.[0-9]+){0,3}$/;

/** Compare dotted version numbers. Returns a negative number when a is older than b, 0 when equal, positive when newer. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Accept only a well-formed row, and only a secure link, so a bad row can never send students somewhere odd. */
export function parseRelease(row: unknown): Release | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.version !== 'string' || !VERSION.test(r.version)) return null;
  const min = typeof r.min_version === 'string' && VERSION.test(r.min_version) ? r.min_version : '0.0.0';
  const url = typeof r.download_url === 'string' && /^https:\/\//i.test(r.download_url) ? r.download_url : '';
  const notes = typeof r.notes === 'string' ? r.notes.slice(0, 2000) : '';
  return { version: r.version, minVersion: min, downloadUrl: url, notes };
}

/** The newest release the dashboard announced, or null when it cannot be loaded. */
export async function fetchRelease(): Promise<Release | null> {
  if (!cloudEnabled || !supabase) return null;
  const { data, error } = await supabase.from('app_release').select('version, min_version, download_url, notes').eq('id', 1).maybeSingle();
  if (error) return null;
  return parseRelease(data);
}

export type UpdateState = 'none' | 'available' | 'required';

export function updateState(release: Release | null, current: string = APP_VERSION): UpdateState {
  if (!release || !release.downloadUrl) return 'none';
  if (compareVersions(current, release.minVersion) < 0 && compareVersions(release.version, current) > 0) return 'required';
  return compareVersions(release.version, current) > 0 ? 'available' : 'none';
}
