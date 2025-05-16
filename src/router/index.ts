import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Settings from '@/views/Settings.vue'
import Analytics from '@/views/Analytics.vue'
import DeviceDetails from '@/views/DeviceDetails.vue'
import Login from '@/views/Login.vue'
import { authToken, currentUser } from '@/lib/api'
import { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Login',
        requiresAuth: false
      }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        title: 'Dashboard',
        requiresAuth: true,
      }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: Analytics,
      meta: {
        title: 'Usage Analytics',
        requiresAuth: true,
        roles: [UserRole.Parent, UserRole.Child]
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        title: 'Settings',
        requiresAuth: true,
        roles: [UserRole.Admin, UserRole.Parent] // Added roles
      }
    },
    {
      path: '/device/:id',
      name: 'device-details',
      component: DeviceDetails,
      props: true,
      meta: {
        title: 'Device Details',
        requiresAuth: true
      }
    }
  ]
})

// Navigation guard
router.beforeEach((to, _, next) => {
  // Check if the route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!authToken.value

  // If route requires auth and user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // If user is authenticated and trying to access login page, redirect to appropriate page
  if (isAuthenticated && to.name === 'login') {
    // Get user role
    const userRole = currentUser.value?.role

    // Redirect Parent and Child users to Analytics, Admin to Dashboard
    if (userRole === UserRole.Parent || userRole === UserRole.Child) {
      next({ name: 'analytics' })
    } else {
      next({ name: 'dashboard' })
    }
    return
  }

  // Otherwise, proceed as normal
  next()
})

export default router