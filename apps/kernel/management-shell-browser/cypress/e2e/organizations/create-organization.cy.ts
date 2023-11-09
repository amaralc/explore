describe('Create an organization', () => {
  before(() => {
    cy.firebaseGoogleLogin();
  });

  describe('Navigate to organizations pricing page', () => {
    it('should support mobile viewport', () => {
      cy.useViewport('desktop');
      cy.visit('/dashboard');
      // cy.get('#sidebar-toggle').click();
      cy.get('#tenant-switch-button').click();
      cy.get('a')
        .contains(/Create Organization/)
        .click();
      cy.url().should('include', '/dashboard/organizations/plans');
      cy.get('#free-plan-card').within(($el) => {
        cy.get('a').click();
      });
      cy.url().should('include', '/dashboard/organizations/new?plan=free');
    });
  });
});
