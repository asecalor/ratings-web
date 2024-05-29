describe('Client Ratings App', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('http://localhost:3001');
  });

  it('displays the title', () => {
    cy.contains('Client Ratings').should('be.visible');
  });

  it('fetches and displays ratings', () => {
    // Ensure the backend server is running and providing actual data
    cy.get('ul').within(() => {
      cy.get('li').should('have.length.at.least', 1);
      cy.get('li').first().contains('Provider ID:');
    });
  });

  it('displays stars for ratings', () => {
    cy.get('.stars').first().should('contain.text', '★');
  });

  it('displays "No ratings found" when there are no ratings', () => {
    // Ensure the backend server is running and providing empty response for this test
    // or you can directly test by making ratings state empty
    cy.get('ul').contains('No ratings found').should('be.visible');
  });

  it('handles API errors gracefully', () => {
    // Ensure the backend server is running and returning error response for this test
    // You can also simulate API errors by mocking the request in the backend to return an error
    // Alternatively, you can directly simulate error by passing error response to your `ratings` state
    // e.g., setRatings([]);
    cy.get('ul').contains('No ratings found').should('be.visible');
  });
});
