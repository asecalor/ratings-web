// cypress/integration/app_spec.js

describe('Client Ratings App', () => {
  beforeEach(() => {
    // Intercept the API call to return mock data
    cy.intercept('GET', 'http://localhost:3000/review/rating', {
      fixture: 'ratings.json' // create a fixture file with this name
    }).as('getRatings');
    
    // Visit the app
    cy.visit('http://localhost:3002');
  });

  it('displays the title', () => {
    cy.contains('Client Ratings').should('be.visible');
  });

  it('fetches and displays ratings', () => {
    cy.wait('@getRatings');
    cy.get('ul').within(() => {
      cy.get('li').should('have.length.at.least', 1);
      cy.get('li').first().contains('Provider ID:');
    });
  });

  it('displays stars for ratings', () => {
    cy.wait('@getRatings');
    cy.get('.stars').first().should('contain.text', '★');
  });

  it('displays "No ratings found" when there are no ratings', () => {
    // Intercept API call with empty response for this test
    cy.intercept('GET', 'http://localhost:3000/review/rating', []).as('getEmptyRatings');
    cy.reload();
    cy.wait('@getEmptyRatings');
    cy.get('ul').contains('No ratings found').should('be.visible');
  });

  it('handles API errors gracefully', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating', {
      statusCode: 500,
      body: {}
    }).as('getRatingsError');
    cy.reload();
    cy.wait('@getRatingsError');
    cy.get('ul').contains('No ratings found').should('be.visible');
  });
});
