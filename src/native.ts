import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';
import { cloudEnabled } from './config';
import { handleAuthUrl } from './cloud';

const handled = new Set<string>();

async function onReturnLink(url: string): Promise<void> {
  if (handled.has(url)) return;
  handled.add(url);
  Browser.close().catch(() => undefined);
  const problem = await handleAuthUrl(url);
  if (problem) window.dispatchEvent(new CustomEvent('optiq:notice', { detail: problem }));
}

/** Android shell setup. Does nothing in a normal browser. */
export function initNative(): void {
  if (!Capacitor.isNativePlatform()) return;

  StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  StatusBar.setBackgroundColor({ color: '#050c2b' }).catch(() => undefined);

  // Back button: step back through screens, and leave the app from Home.
  App.addListener('backButton', () => {
    const path = window.location.hash.replace(/^#/, '') || '/';
    if (path === '/' || window.history.length <= 1) {
      App.exitApp().catch(() => undefined);
    } else {
      window.history.back();
    }
  }).catch(() => undefined);

  if (cloudEnabled) {
    // Links that bring the student back after Google sign-in, email verification or password reset.
    App.addListener('appUrlOpen', ({ url }) => {
      void onReturnLink(url);
    }).catch(() => undefined);
    App.getLaunchUrl()
      .then((launch) => {
        if (launch?.url) void onReturnLink(launch.url);
      })
      .catch(() => undefined);
  }
}
