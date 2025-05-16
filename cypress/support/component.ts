import { mount } from 'cypress/vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../../src/router'

// Import global styles
import '../../src/index.css'

// Augment the Cypress namespace to include type definitions for
// the mount function
declare global {
    namespace Cypress {
        interface Chainable {
            mount: typeof mount
        }
    }
}

Cypress.Commands.add('mount', (component, options = {}) => {
    // Setup a fresh Pinia instance for each test
    const pinia = createPinia()

    // Create router with memory history for component testing
    const router = createRouter({
        history: createMemoryHistory(),
        routes
    })

    // Use any global plugins from your main.ts here
    const app = createApp(component)
    app.use(pinia)
    app.use(router)

    // Add any global components or directives here

    return mount(component, {
        global: {
            plugins: [pinia, router],
        },
        ...options
    })
})