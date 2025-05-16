/**
 * This file contains the entry point for browser mocks
 * It should be imported in your main.ts file
 */

async function setupMocks() {
  // Enable MSW based on environment variable
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./browser')
    
    // Start the worker with all handlers
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    })
    
    console.log('MSW Mock API initialized with HTTP and WebSocket handlers')
  }
}

export { setupMocks }