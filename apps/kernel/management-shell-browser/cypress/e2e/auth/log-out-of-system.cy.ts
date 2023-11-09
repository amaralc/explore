describe('Log out from system', () => {
  before(() => {
    cy.firebaseGoogleLogin();
  });

  it('should log out of system', () => {
    cy.visit('/dashboard');
    cy.contains(/Overview/).should('exist');
    cy.get('[data-testid="account-button"]').click();
    cy.get('button')
      .contains(/Logout/)
      .click();
    cy.url().should('not.include', '/dashboard');
    cy.url().should('equal', 'http://localhost:4200/');
  });
});
