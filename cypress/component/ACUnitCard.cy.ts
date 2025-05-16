/// <reference types="cypress" />

import ACUnitCard from '../../src/components/ACUnitCard.vue'

describe('ACUnitCard Component', () => {
  const mockDevice = {
    id: '1',
    name: 'Living Room AC',
    location: 'Living Room',
    isOn: true,
    temperature: 24,
    usageHours: 5,
    dailyLimit: 10,
    parentControlled: false
  }

  it('should render the component', () => {
    cy.mount(ACUnitCard, {
      props: {
        device: mockDevice
      }
    })

    cy.get('.card').should('exist')
  })

  it('should display device name and location', () => {
    cy.mount(ACUnitCard, {
      props: {
        device: mockDevice
      }
    })

    cy.contains(mockDevice.name).should('be.visible')
    cy.contains(mockDevice.location).should('be.visible')
  })

  it('should show running status when device is on', () => {
    cy.mount(ACUnitCard, {
      props: {
        device: mockDevice
      }
    })

    cy.contains('Running').should('be.visible')
    cy.get('.bg-green-500').should('exist')
  })

  it('should show off status when device is off', () => {
    const offDevice = { ...mockDevice, isOn: false }
    
    cy.mount(ACUnitCard, {
      props: {
        device: offDevice
      }
    })

    cy.contains('Off').should('be.visible')
    cy.get('.bg-gray-300').should('exist')
  })

  it('should emit view-details event when clicked', () => {
    const onViewDetails = cy.stub().as('viewDetailsHandler')
    
    cy.mount(ACUnitCard, {
      props: {
        device: mockDevice
      },
      listeners: {
        'view-details': onViewDetails
      }
    })

    cy.get('.card').click()
    cy.get('@viewDetailsHandler').should('have.been.calledWith', mockDevice.id)
  })

  it('should calculate correct usage percentage', () => {
    cy.mount(ACUnitCard, {
      props: {
        device: mockDevice
      }
    })

    // Usage is 5 hours out of 10 hour limit = 50%
    cy.contains('50% used').should('be.visible')
  })
})