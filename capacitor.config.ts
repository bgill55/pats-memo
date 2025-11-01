import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'pats-memo',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    webContents: {
      useSoftwareRendering: true
    }
  }
};

export default config;