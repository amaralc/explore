describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/peers');
  });

  it('should redirect non-authenticated user to sign-in page', () => {
    cy.url().should('include', '/sign-in');
  });
});
