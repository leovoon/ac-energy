<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Sonner } from './components/ui/sonner';
import { useDeviceStore } from './stores/deviceStore';
import { useUserStore } from './stores/userStore';
import { useWebSocketStore } from './stores/webSocketStore';
import { Button } from './components/ui/button';
import { useToast } from './composables/useToast';

const deviceStore = useDeviceStore();
const userStore = useUserStore();
const webSocketStore = useWebSocketStore();
const toast = useToast();

// Handle logout
const handleLogout = () => {
  userStore.logout();
  toast.success('You have been logged out successfully');
};

onMounted(async () => {
  // Fetch user data
  await userStore.fetchCurrentUser();

  // Fetch device data
  await deviceStore.fetchDevices();

  // Connect to WebSocket for real-time updates
  webSocketStore.connect();
});
</script>

<template>
  <!-- Authenticated layout with sidebar -->
  <template v-if="userStore.isAuthenticated">
    <SidebarProvider>
      <!-- Sidebar Component -->
      <AppSidebar />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <header class="border-b bg-card p-4">
          <div class="flex items-center justify-between">
            <!-- Mobile sidebar trigger - this will only show on mobile screens -->
            <div class="flex items-center gap-2">
              <SidebarTrigger class="md:hidden" />
              <h1 class="text-xl font-bold">{{ $route.meta.title || 'AC Energy Monitor' }}</h1>
            </div>

            <div v-if="userStore.currentUser" class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">{{ userStore.currentUser.name }}</span>
                <div class="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {{ userStore.currentUser.role }}
                </div>
              </div>
              <Button variant="outline" size="sm" @click="handleLogout" class="flex items-center gap-1">
                <span>Logout</span>
                <span class="text-sm">🚪</span>
              </Button>
            </div>
          </div>
        </header>

        <main class="flex-1 p-6 overflow-auto">
          <RouterView />
        </main>
      </div>
    </SidebarProvider>
  </template>

  <!-- Unauthenticated layout (no sidebar) -->
  <template v-else>
    <div class="min-h-screen">
      <RouterView />
    </div>
  </template>

  <!-- Toast Notifications -->
  <Sonner richColors />
</template>