import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Download } from 'lucide-react';
import { APP_VERSION, fetchRelease, updateState, type Release } from '../update';

function openDownload(url: string): void {
  if (Capacitor.isNativePlatform()) {
    Browser.open({ url }).catch(() => window.open(url, '_blank', 'noopener'));
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

/** Tells students a newer version is ready. A "required" update cannot be dismissed. */
export default function UpdatePrompt() {
  const [release, setRelease] = useState<Release | null>(null);
  const [later, setLater] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = () => {
      fetchRelease()
        .then((r) => {
          if (alive) setRelease(r);
        })
        .catch(() => undefined);
    };
    check();
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const state = updateState(release);
  if (!release || state === 'none' || (state === 'available' && later)) return null;
  const required = state === 'required';
  const lines = release.notes.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className='sheet-wrap' role='dialog' aria-modal='true' aria-labelledby='upd-title'>
      <div className='sheet upd'>
        <div className='upd-icon'>
          <Download size={26} />
        </div>
        <h2 id='upd-title'>{required ? 'Update required' : 'Update available'}</h2>
        <p className='upd-sub'>
          {required
            ? 'This version of OPTIQ is too old to keep working. Please install the newest version.'
            : 'A new version of OPTIQ is ready, with the latest courses, notes and fixes.'}
        </p>
        <p className='upd-ver'>
          Your version {APP_VERSION} &rarr; new version {release.version}
        </p>
        {lines.length > 0 && (
          <ul className='upd-notes'>
            {lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
        <div className='actions'>
          {!required && (
            <button className='btn btn-ghost' onClick={() => setLater(true)}>
              Later
            </button>
          )}
          <button className='btn btn-primary' onClick={() => openDownload(release.downloadUrl)}>
            Update now
          </button>
        </div>
      </div>
    </div>
  );
}
