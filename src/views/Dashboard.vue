<script setup lang="ts">
import DashboardGrid from '@/components/DashboardGrid.vue';
import ParentControlPanel from '@/components/ParentControlPanel.vue';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const isParent = computed(() => userStore.isParent);
</script>

<template>
  <div>
    
    <!-- Main Dashboard Grid -->
    <DashboardGrid />
    
    <!-- Parent Control Panel (only shown to parent users) -->
    <ParentControlPanel v-if="isParent" />
  </div>
</template>