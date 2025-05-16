import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserRole } from '@/types';
import type { User } from '@/types';
import { login as apiLogin, logout as apiLogout, authToken, currentUser as apiCurrentUser } from '@/lib/api';
import router from '@/router';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);


  // Check if current user is a parent
  const isParent = computed(() => {
    return currentUser.value?.role === UserRole.Parent;
  });

  // Check if current user is an admin
  const isAdmin = computed(() => {
    return currentUser.value?.role === UserRole.Admin;
  });

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!authToken.value;
  });

  // Fetch current user from API
  const fetchCurrentUser = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // If we have a stored user from the API module, use that
      if (apiCurrentUser.value) {
        currentUser.value = {
          id: apiCurrentUser.value.id.toString(),
          name: apiCurrentUser.value.username || 'User',
          role: apiCurrentUser.value.role as UserRole
        };
        return;
      }

      // Otherwise fetch from API
      const response = await fetch('/api/user', {
        headers: authToken.value ? {
          'Authorization': `Bearer ${authToken.value}`
        } : {}
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const userData = await response.json();
      currentUser.value = userData;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching user:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Login user
  const login = async (username: string, password: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const user = await apiLogin(username, password);
      await fetchCurrentUser();
      return user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Invalid credentials';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout user
  const logout = () => {
    apiLogout();
    currentUser.value = null;
    router.push('/login');
  };

  // Update user role
  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken.value}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) throw new Error('Failed to update user role');

      // If updating current user, update local state
      if (currentUser.value && currentUser.value.id === userId) {
        currentUser.value.role = role;
      }

      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      return false;
    }
  };

  // Check if user has permission for a specific action
  const hasPermission = (requiredRoles: UserRole[] | string[]) => {
    if (!currentUser.value) return false;
    return requiredRoles.includes(currentUser.value.role);
  };

  return {
    currentUser,
    isLoading,
    error,
    isParent,
    isAdmin,
    isAuthenticated,
    fetchCurrentUser,
    login,
    logout,
    updateUserRole,
    hasPermission
  };
});