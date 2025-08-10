describe('Protected private routes', () => {
  beforeEach(() => {
    cy.firebaseLogout();
  });

  it('should be redirected from dashboard to login page', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.get('button').contains('Google').should('exist');
  });
});
