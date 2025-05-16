/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should login successfully with admin credentials', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.\\[\\.border-t\\]\\:pt-6 > .flex > :nth-child(1)').click();
    cy.get('.space-y-4 > .inline-flex').click();
    /* ==== End Cypress Studio ==== */
  })

  it('should login successfully with parent credentials', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.\\[\\.border-t\\]\\:pt-6 > .flex > :nth-child(2)').click();
    cy.get('.space-y-4 > .inline-flex').click();
    /* ==== End Cypress Studio ==== */
  })

  it('should login successfully with child credentials', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.\\[\\.border-t\\]\\:pt-6 > .flex > :nth-child(3)').click();
    cy.get('.space-y-4 > .inline-flex').click();
    /* ==== End Cypress Studio ==== */
  })
})