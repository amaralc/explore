import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    video: false,
    screenshotOnRunFailure: false,
  },
  env: {
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    googleAccessToken: process.env.GOOGLE_ACCESS_TOKEN, // Valid token (get it from the application)
    firebaseApiKey: process.env.VITE_FIREBASE_API_KEY,
  },
});
