describe('Redirect', () => {
  it('should redirect non-authenticated user', () => {
    cy.visit('/');
    cy.url().should('include', '/sign-in');
  });
});
