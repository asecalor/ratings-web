describe('Client Ratings App', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('http://localhost:3002');
  });

  it('displays the title', () => {
    cy.contains('Client Ratings').should('be.visible');
  });

  it('fetches and displays ratings', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating').as('getRatings');

    // Ensure the backend server is running and providing actual data
    cy.wait('@getRatings').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      cy.get('ul').within(() => {
        cy.get('li').should('have.length.at.least', 1);
        cy.get('li').first().contains('Provider ID:');
      });
    });
  });

  it('displays stars for ratings', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating').as('getRatings');

    cy.wait('@getRatings').then(({ response }) => {
      expect(response.statusCode).to.be.oneOf([200, 304]);
      cy.get('.stars').first().should('contain.text', '★');
    });
  });

  it('displays "No ratings found" when there are no ratings', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating', {
      statusCode: 200,
      body: []
    }).as('getEmptyRatings');

    cy.wait('@getEmptyRatings').then(({ response }) => {
      expect(response.body).to.have.length(0);
      cy.get('ul').contains('No ratings found').should('be.visible');
    });
  });

  it('handles API errors gracefully', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating', {
      statusCode: 500,
      body: { error: "Internal Server Error" }
    }).as('getErrorRatings');

    cy.wait('@getErrorRatings').then(({ response }) => {
      expect(response.statusCode).to.eq(500);
      cy.get('ul').contains('No ratings found').should('be.visible');
    });
  });

  it('should display different star ratings correctly', () => {
    cy.intercept('GET', 'http://localhost:3000/review/rating').as('getRatings');

    cy.wait('@getRatings').then(({ response }) => {
      expect(response.statusCode).to.be.oneOf([200, 304]);
      const ratings = response.body;

      ratings.forEach(rating => {
        const stars = '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        cy.contains(`Provider ID: ${rating.providerId}`).within(() => {
          cy.get('.stars').should('have.text', stars);
        });
      });
    });
  });
});
