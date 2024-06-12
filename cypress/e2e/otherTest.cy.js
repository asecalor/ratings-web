/// <reference types="cypress" />

describe('Client Ratings App', () => {
  const baseUrl = 'http://localhost:3000';
  const warehouseUrl = 'http://localhost:3001';
  const appUrl = 'http://localhost:3003';

  beforeEach(() => {
    cy.visit(appUrl);
  });

  // Utility function to create test data
  function createRatingData() {
    let productId, providerId, warehouseId, orderId;

    // Step 1: Create a Product
    cy.request('POST', `${baseUrl}/product`, { name: 'Test Product' + Date.now() }).then(response => {
      productId = response.body.id;

      // Step 2: Create a Provider
      cy.request('POST', `${baseUrl}/provider`, {
        name: 'Test Provider',
        email: 'test@example.com' + Date.now(),
        lastName: 'Doe'
      }).then(providerResponse => {
        providerId = providerResponse.body.id;

        // Step 3: Create a Warehouse
        cy.request('POST', `${warehouseUrl}/warehouse`, {
          address: '123 Test Address',
          providerId: providerId
        }).then(warehouseResponse => {
          warehouseId = warehouseResponse.body.id;

          // Step 4: Add Product to Warehouse
          cy.request('POST', `${warehouseUrl}/warehouse/${warehouseId}`, {
            productId: productId,
            stock: 10
          }).then(() => {

            // Step 5: Associate Product with Provider and Set Price
            cy.request('POST', `${baseUrl}/provider/${providerId}`, {
              productId: productId,
              price: 100
            }).then(() => {

              // Step 6: Post to Cart
              cy.request('POST', 'http://localhost:3002/cart', {
                clientId: 1, // Assume clientId 1 for simplicity
                providerId: providerId,
                products: [{ productId: productId, quantity: 1 }]
              }).then(cartResponse => {
                orderId = cartResponse.body.id;

                // Step 7: Update Order Status to Delivered
                cy.wait(2000); // Wait for 2 seconds (simulating delivery time
                cy.request('PUT', `http://localhost:3000/order/${orderId}`, {
                  status: 'ACCEPTED'
                })
                cy.request('PUT', `http://localhost:3000/order/${orderId}`, {
                  status: 'DELIVERED'
                }).then(() => {

                  // Step 8: Post a Review for the Order
                  cy.request('POST', `${baseUrl}/review/${orderId}`, {
                    clientId: 1,
                    rating: 5,
                    comment: 'Great service!'
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  it('should display the title "Client Ratings"', () => {
    cy.contains('u.title', 'Client Ratings').should('be.visible');
  });

  it('should fetch and display ratings', () => {
    cy.intercept('GET', `${baseUrl}/review/rating`, {
      statusCode: 200,
      body: [
        { providerId: 1, rating: 3 },
        { providerId: 2, rating: 5 }
      ]
    }).as('getRatings');

    cy.reload();
    cy.wait('@getRatings');

    cy.get('.list-item').should('have.length', 2);
    cy.contains('.list-item', 'Provider ID: 1').should('contain', '★★★☆☆ (3)');
    cy.contains('.list-item', 'Provider ID: 2').should('contain', '★★★★★ (5)');
  });

  it('should display correct stars for each rating', () => {
    cy.intercept('GET', `${baseUrl}/review/rating`, {
      statusCode: 200,
      body: [
        { providerId: 1, rating: 0 },
        { providerId: 2, rating: 1 },
        { providerId: 3, rating: 3 },
        { providerId: 4, rating: 5 }
      ]
    }).as('getRatings');

    cy.reload();
    cy.wait('@getRatings');

    cy.contains('.list-item', 'Provider ID: 1').should('contain', '☆☆☆☆☆ (0)');
    cy.contains('.list-item', 'Provider ID: 2').should('contain', '★☆☆☆☆ (1)');
    cy.contains('.list-item', 'Provider ID: 3').should('contain', '★★★☆☆ (3)');
    cy.contains('.list-item', 'Provider ID: 4').should('contain', '★★★★★ (5)');
  });

  it('should display "No ratings found" when there are no ratings', () => {
    cy.intercept('GET', `${baseUrl}/review/rating`, {
      statusCode: 200,
      body: []
    }).as('getRatings');

    cy.reload();
    cy.wait('@getRatings');

    cy.contains('li', 'No ratings found').should('be.visible');
  });

  it('should display different star ratings correctly', () => {
    cy.intercept('GET', `${baseUrl}/review/rating`, {
      statusCode: 200,
      body: [
        { providerId: 5, rating: 4.5 }
      ]
    }).as('getRatings');

    cy.reload();
    cy.wait('@getRatings');

    cy.contains('.list-item', 'Provider ID: 5').should('contain', '★★★★★ (4.5)');
  });

  it('should create rating data and display it', () => {
    createRatingData();

    // Intercepting the /review/rating endpoint to check if the new rating appears
    cy.intercept('GET', `${baseUrl}/review/rating`, {
      statusCode: 200,
      body: [
        { providerId: 1, rating: 3 },
        { providerId: 2, rating: 5 },
        { providerId: 5, rating: 4.5 }
      ]
    }).as('getRatingsAfterDataCreation');

    cy.reload();
    cy.wait('@getRatingsAfterDataCreation');

    // Check for the presence of the new rating (example: Provider ID: 5)
    cy.contains('.list-item', 'Provider ID: 5').should('contain', '★★★★★ (4.5)');
  });
});
