export class FlagManager {
  private staticFlags = {
    authProvider: import.meta.env.VITE_FEATURE_FLAG_AUTH_PROVIDER as 'firebase' | 'auth0' | 'amplify' | 'jwt',
    untitledSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_UNTITLED_SECTION_ENABLED === 'true',
    conceptsSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_CONCEPTS_SECTION_ENABLED === 'true',
    pagesSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_PAGES_SECTION_ENABLED === 'true',
    miscSectionEnabled: import.meta.env.VITE_FEATURE_FLAG_MISC_SECTION_ENABLED === 'true',
    mockApisEnabled: import.meta.env.VITE_FEATURE_FLAG_MOCK_APIS_ENABLED === 'true',
    VITE_FEATURE_FLAG_PEER_547_EMAIL_AND_PASSWORD_ENABLED:
      import.meta.env.VITE_FEATURE_FLAG_PEER_547_EMAIL_AND_PASSWORD_ENABLED === 'true',
    VITE_FEATURE_FLAG_PEER_547_GOOGLE_SSO_ENABLED:
      import.meta.env.VITE_FEATURE_FLAG_PEER_547_GOOGLE_SSO_ENABLED === 'true',
    VITE_FEATURE_FLAG_PEER_547_SHOW_AUTH_ISSUER_ENABLED:
      import.meta.env.VITE_FEATURE_FLAG_PEER_547_SHOW_AUTH_ISSUER_ENABLED === 'true',
  };

  private dynamicFlags: Record<string, unknown> = {
    ...this.staticFlags,
  };

  setDynamicFlag<T>(flagName: string, flagValue: T) {
    this.dynamicFlags[flagName] = flagValue;
  }

  getDynamicFlag<T>(flagName: string): T {
    return this.dynamicFlags[flagName] as T;
  }

  resetDynamicFlags() {
    this.dynamicFlags = {
      ...this.staticFlags,
    };
  }
}

export const flagManager = new FlagManager();
