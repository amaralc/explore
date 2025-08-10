describe('List peers that are reference on chosen subjects', () => {
  const subjectsSlugs = ['wasm', 'rust'];
  const firstSubjectSlugInAnyCaseNotation = new RegExp(`${subjectsSlugs[0]}`, 'i');
  const secondSubjectSlugInAnyCaseNotation = new RegExp(`${subjectsSlugs[1]}`, 'i');

  beforeEach(() => {
    cy.visit(`/peers?subjects[]=${subjectsSlugs[0]}&subjects[]=${subjectsSlugs[1]}`);

    cy.fixture('routes/peers/get.json').then((json) => {
      cy.intercept('GET', 'http://localhost:8080/peers**', json).as('get-peers');
    });
    cy.wait('@get-peers');
  });

  it('should only list peers that are related to the desired subjects', () => {
    cy.get('ul')
      .children()
      .each(($el, index, $list) => {
        cy.wrap($el)
          .find('a')
          .invoke('attr', 'href')
          .should('match', /^\/peer\/.+$/g); // Assert it conforms to the pattern "/peer/*"

        cy.wrap($el)
          .find('a')
          .contains(firstSubjectSlugInAnyCaseNotation)
          .should('have.attr', 'href', `/subjects/${subjectsSlugs[0]}`);

        cy.wrap($el)
          .find('a')
          .contains(secondSubjectSlugInAnyCaseNotation)
          .should('have.attr', 'href', `/subjects/${subjectsSlugs[1]}`);
      });
  });
});

export {};
