// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';
import { indexedDbFirebaseSessionRepository } from './firebase';

Cypress.Commands.add('firebaseGoogleLogin', () => {
  cy.log('Logging in to Google with firebase');
  indexedDbFirebaseSessionRepository.addMockSession();
});

Cypress.Commands.add('firebaseLogout', () => {
  cy.log('Logging out of firebase');
  indexedDbFirebaseSessionRepository.removeAllSessions();
});

Cypress.Commands.add('useViewport', (viewport) => {
  cy.log(`Using ${viewport} viewport`);

  /**
   * Material UI breakpoints (https://mui.com/material-ui/customization/breakpoints/)
   * xs, extra-small: 0px
   * sm, small: 600px
   * md, medium: 900px
   * lg, large: 1200px
   * xl, extra-large: 1536px
   */

  if (viewport === 'mobile') {
    cy.viewport(350, 480);
  }

  if (viewport === 'tablet') {
    cy.viewport(900, 640);
  }

  if (viewport === 'desktop') {
    cy.viewport(1920, 1080);
  }
});
