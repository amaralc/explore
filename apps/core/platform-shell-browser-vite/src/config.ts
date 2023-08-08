import { FirebaseOptions } from 'firebase/app';

export const featureFlags = {
  unleashFlagProviderEnabled: true,
  'PEER-567-sign-in-with-google': true,
};

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const unleashConfig = {
  url: import.meta.env['VITE_UNLEASH_URL'] as string, // '<unleash-url>/api/frontend', // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  clientKey: import.meta.env['VITE_UNLEASH_CLIENT_KEY'] as string, //'<your-token>', // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: import.meta.env['VITE_UNLEASH_APP_NAME'] as string, // 'your-app-name', // The name of your application. It's only used for identifying your application
};
