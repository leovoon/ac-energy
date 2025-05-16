/// <reference types="cypress" />

describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.\\[\\.border-t\\]\\:pt-6 > .flex > :nth-child(2)').click();
    cy.get('.space-y-4 > .inline-flex').click();
  })

  it('should load the home page', () => {
    cy.url().should('include', '/')
  })

  it('should have a navigation menu', () => {
      cy.get(':nth-child(1) > div.w-full > .min-w-0').should('contain', 'Dashboard')
  })

  it('should display AC units if available', () => {
    // This test assumes there will be AC units displayed
    // You might need to mock API responses for consistent testing
        cy.get(':nth-child(1) > .bg-card').should('contain', 'Living Room AC')

  })

})