import { setupWorker } from 'msw/browser'
import { httpHandlers } from './handlers'
import { webSocketHandlers } from './websocket'

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...httpHandlers, ...webSocketHandlers)

// Make worker available in browser console for debugging
// @ts-ignore
window.msw = { worker }

console.log('🔶 MSW initialized')