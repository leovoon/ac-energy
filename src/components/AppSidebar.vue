<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/composables/useToast';
import DarkMode from './DarkMode.vue';
import { UserRole } from '@/types';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const deviceStore = useDeviceStore();
const toast = useToast();

const currentRouteName = computed(() => route.name);

// Define navigation item type
interface NavigationItem {
  name: string;
  label: string;
  icon: string;
  roles: UserRole[];
  order: Record<UserRole, number>;
}

// Define all navigation items
const allNavigationItems: NavigationItem[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'GridIcon',
    roles: [], // Empty roles array means accessible to all roles
    order: {
      [UserRole.Admin]: 1,
      [UserRole.Parent]: 2,
      [UserRole.Child]: 2
    }
  },
  {
    name: 'analytics',
    label: 'Analytics',
    icon: 'BarChartIcon',
    roles: [UserRole.Parent, UserRole.Child, UserRole.Admin], // Only visible to Parent and Child roles
    order: {
      [UserRole.Admin]: 1, // Not visible to admin
      [UserRole.Parent]: 1,
      [UserRole.Child]: 1
    }
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'SettingsIcon',
    roles: [UserRole.Admin, UserRole.Parent], // Updated roles
    order: {
      [UserRole.Admin]: 2,
      [UserRole.Parent]: 3,
      [UserRole.Child]: 99 // Child should not see this, so order is high
    }
  }
];

// Filter and sort navigation items based on user role
const navigationItems = computed(() => {
  const userRole = userStore.currentUser?.role;

  // First filter items based on roles
  const filteredItems = allNavigationItems.filter(item => {
    // If roles array is empty, the item is accessible to all roles
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // Otherwise, check if the user's role is in the allowed roles
    return userRole && item.roles.includes(userRole as UserRole);
  });

  // Then sort items based on order for the current role
  return filteredItems.sort((a, b) => {
    if (!userRole) return 0;

    const orderA = a.order?.[userRole] || 99;
    const orderB = b.order?.[userRole] || 99;

    return orderA - orderB;
  });
});

// Navigation methods
const navigateTo = (routeName: string) => {
  router.push({ name: routeName });
};

// For mobile, we might want to close the sidebar when navigating
const { isMobile, toggleSidebar } = useSidebar();
const navigateAndCloseSidebar = (routeName: string) => {
  navigateTo(routeName);
  if (isMobile.value) {
    toggleSidebar();
  }
};

// Handle device navigation
const navigateToDevice = (deviceId: string) => {
  router.push({ name: 'device-details', params: { id: deviceId } });
  if (isMobile.value) {
    toggleSidebar();
  }
};

// Handle logout
const handleLogout = () => {
  userStore.logout();
  toast.success('You have been logged out successfully');
};
</script>

<template>
  <Sidebar collapsible="offcanvas" class="h-screen border-r">
    <SidebarHeader>
      <div class="p-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold">AC Energy</h1>
            <p class="text-xs text-muted-foreground">Monitor & Control</p>
          </div>
          <DarkMode class="ml-2" />
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navigationItems" :key="item.name">
              <SidebarMenuButton :is-active="currentRouteName === item.name" @click="navigateAndCloseSidebar(item.name)">
                <div class="flex items-center">
                  <!-- Icons would go here - using placeholders for now -->
                  <div class="w-5 h-5 mr-2 flex items-center justify-center">
                    <div v-if="item.icon === 'GridIcon'" class="text-sm">
                      🎛️
                    </div>
                    <div v-else-if="item.icon === 'BarChartIcon'" class="text-sm">
                      📊
                    </div>
                    <div v-else-if="item.icon === 'SettingsIcon'" class="text-sm">
                      ⚙️
                    </div>
                  </div>
                  {{ item.label }}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <!-- Devices Section -->
      <SidebarGroup>
        <SidebarGroupLabel>Devices</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="device in deviceStore.devices" :key="device.id">
              <SidebarMenuButton :is-active="route.params.id === device.id" @click="navigateToDevice(device.id)">
                <div class="flex items-center w-full">
                  <div :class="`w-2 h-2 rounded-full ${device.isOn ? 'bg-green-500' : 'bg-gray-300'} mr-2`"></div>
                  <span class="truncate">{{ device.name }}</span>
                  <Badge v-if="device.parentControlled" variant="secondary" class="ml-auto text-xs">
                    P
                  </Badge>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <div class="p-4 border-t flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
            {{ userStore.currentUser?.name?.[0] || 'U' }}
          </div>
          <div>
            <p class="text-sm font-medium">{{ userStore.currentUser?.name }}</p>
            <p class="text-xs text-muted-foreground">{{ userStore.currentUser?.role }}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="handleLogout">
          <span class="sr-only">Logout</span>
          <span>🚪🏃🏼</span>
        </Button>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>