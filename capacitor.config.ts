import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pegaso.app',
  appName: 'Pegaso',
  webDir: 'out',
  server: {
    // La APK es una cascaron: carga la PWA publicada en GitHub Pages.
    // Offline y auto-actualización se gestionan con el Service Worker del sitio.
    url: 'https://k-sen6.github.io/pegaso/',
    androidScheme: 'https',
  },
};

export default config;
