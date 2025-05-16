# AC-Energy: Household AC Monitoring & Control

## Overview
AC-Energy is a real-time monitoring and control system for household air conditioning units. Built with Vue 3, TypeScript, and Vite, it provides homeowners with powerful tools to track usage, set limits, and implement parental controls.

## Features
- Real-time AC usage tracking
- Parental controls and usage limits
- Automated shutdown capabilities
- Historical usage reporting and analytics
- Energy efficiency recommendations

## Technology Stack
- Vue 3 with Composition API
- TypeScript for type safety
- Vite for fast development
- Tailwind CSS for styling
- Pinia for state management
- Shadcn-vue for UI components

## Getting Started
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Testing
### Cypress
The project uses Cypress for both component and E2E testing.

```bash
# Run component tests
bun run cy:run-unit

# Open component test runner
bun run cy:open-unit

# Run E2E tests
bun run cy:run-e2e

# Open E2E test runner
bun run cy:open-e2e

# Run E2E tests with server
bun run cy:e2e
```
