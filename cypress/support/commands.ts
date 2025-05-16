export {}; // Ensure this file is treated as a module
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- Login command for authentication --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  // Wait for login to complete
  cy.url().should('not.include', '/login')
})

// -- Select AC unit by name --
Cypress.Commands.add('selectACUnit', (name: string) => {
  cy.contains('.card', name).click()
})

// -- Toggle AC unit power state --
Cypress.Commands.add('toggleACPower', (deviceId: string) => {
  cy.get(`[data-device-id="${deviceId}"] [data-cy=power-toggle]`).click()
  // Wait for UI to update
  cy.wait(500)
})

// -- Set temperature for device --
Cypress.Commands.add('setTemperature', (deviceId: string, temperature: number) => {
  cy.get(`[data-device-id="${deviceId}"] [data-cy=temperature-control]`).clear().type(temperature.toString())
  cy.get(`[data-device-id="${deviceId}"] [data-cy=apply-temperature]`).click()
})

// -- Check energy usage for device --
Cypress.Commands.add('checkEnergyUsage', (deviceId: string) => {
  cy.get(`[data-device-id="${deviceId}"] [data-cy=energy-usage]`).should('exist')
  return cy.get(`[data-device-id="${deviceId}"] [data-cy=usage-percentage]`)
})

// -- Type declaration for TypeScript --
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login to the application
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to select an AC unit by name
       * @example cy.selectACUnit('Living Room AC')
       */
      selectACUnit(name: string): Chainable<Element>
      
      /**
       * Custom command to toggle AC power state
       * @example cy.toggleACPower('device-1')
       */
      toggleACPower(deviceId: string): Chainable<Element>
      
      /**
       * Custom command to set temperature for a device
       * @example cy.setTemperature('device-1', 22)
       */
      setTemperature(deviceId: string, temperature: number): Chainable<Element>
      
      /**
       * Custom command to check energy usage for a device
       * @example cy.checkEnergyUsage('device-1').should('contain', '50%')
       */
      checkEnergyUsage(deviceId: string): Chainable<JQuery<HTMLElement>>
    }
  }
}