import { setupServer } from 'msw/node'
import { httpHandlers } from './handlers'
import { webSocketHandlers } from './websocket'

// Combine all handlers
const allHandlers = [...httpHandlers, ...webSocketHandlers]

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...allHandlers)