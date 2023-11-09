import { IConfig } from '@unleash/proxy-client-react';

export const enableDevTools = import.meta.env.VITE_ENABLE_REDUX_DEV_TOOLS === 'true';

export const amplifyConfig = {
  aws_project_region: import.meta.env.VITE_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id: import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: import.meta.env.VITE_AWS_COGNITO_REGION,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
};

export const auth0Config = {
  base_url: import.meta.env.VITE_AUTH0_BASE_URL,
  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
  issuer_base_url: import.meta.env.VITE_AUTH0_ISSUER_BASE_URL,
};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export const gtmConfig = {
  containerId: import.meta.env.VITE_GTM_CONTAINER_ID,
};

export const mapboxConfig = {
  apiKey: import.meta.env.VITE_MAPBOX_API_KEY,
};

export const version = '6.4.2';

export const unleashConfig: IConfig = {
  url: import.meta.env.VITE_UNLEASH_FRONTEND_URL, // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  clientKey: import.meta.env.VITE_UNLEASH_CLIENT_KEY, // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  appName: 'kernel-management-shell', // How often (in seconds) the client should poll the proxy for updates
  refreshInterval: 15, // The name of your application. It's only used for identifying your application
};

export const featureFlags = {
  authProvider: import.meta.env.VITE_FEATURE_FLAG_AUTH_PROVIDER as 'firebase' | 'auth0' | 'amplify' | 'jwt',
  untitledSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_UNTITLED_SECTION_ENABLED === 'true',
  conceptsSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_CONCEPTS_SECTION_ENABLED === 'true',
  pagesSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_PAGES_SECTION_ENABLED === 'true',
  miscSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_MISC_SECTION_ENABLED === 'true',
};
