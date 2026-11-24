import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.optiq.app',
  appName: 'OPTIQ',
  webDir: 'dist',
  backgroundColor: '#050c2b',
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#050c2b',
      showSpinner: false,
    },
  },
};

export default config;
