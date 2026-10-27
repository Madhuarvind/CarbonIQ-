import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carbotracker.app',
  appName: 'Carbo-Tracker',
  webDir: 'out',
  // Optional: during development or if you want the Capacitor app to load
  // a remote or local dev server instead of the static `out` folder,
  // uncomment and set `server.url` appropriately.
  // Examples:
  //  - Android emulator (localhost on host machine): use 'http://10.0.2.2:3000'
  //  - Remote deployed URL: 'https://your-deployed-url.example'
  //  - Local device on same network: 'http://192.168.1.42:3000'
  // Note: when `server.url` is set, Capacitor will load the URL in the WebView
  // and will not use the `webDir` static files. Keep it commented for static builds.
  // server: { url: 'http://10.0.2.2:3000', cleartext: true }
};

export default config;
