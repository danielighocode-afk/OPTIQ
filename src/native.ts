import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

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
}
