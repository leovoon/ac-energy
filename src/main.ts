import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './index.css'
import App from './App.vue'

// Import MSW setup function
import { setupMocks } from './mocks'

// Function to initialize the app
const initApp = () => {
  const pinia = createPinia()
  const app = createApp(App)
  
  app.use(pinia)
  app.use(router)
  app.mount('#app')
}

// Use MSW based on environment variable
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  setupMocks().then(initApp)
} else {
  initApp()
}
