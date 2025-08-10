describe('Access private routes', () => {
  before(() => {
    cy.firebaseGoogleLogin();
  });

  it('should access dashboard page', () => {
    cy.visit('/dashboard');
    cy.contains(/Overview/).should('exist');
  });

  after(() => {
    cy.firebaseLogout();
  });
});
