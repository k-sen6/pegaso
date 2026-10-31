import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pegaso.app',
  appName: 'Pegaso',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Sin server.url: la APK carga el bundle enbargado local (100% offline).
    // DNS de github.io no interviene; la actualización remota va por OTA (fase 2).
  },
};

export default config;
