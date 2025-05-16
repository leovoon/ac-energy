<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ACUnitCard from "./ACUnitCard.vue";
import DeviceDrawer from "./DeviceDrawer.vue";
import { useDeviceStore } from "@/stores/deviceStore";

const deviceStore = useDeviceStore();

// For device drawer
const isDrawerOpen = ref(false);
const selectedDeviceId = ref<string | null>(null);

const openDeviceDrawer = (deviceId: string) => {
  selectedDeviceId.value = deviceId;
  isDrawerOpen.value = true;
};
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
    <div v-for="device in deviceStore.devices" :key="device.id">
      <ACUnitCard 
        :device="device" 
        @view-details="openDeviceDrawer"
      />
    </div>
    <Card v-if="deviceStore.devices.length === 0" class="col-span-full">
      <CardHeader>
        <CardTitle>No AC Units Found</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">Connect your first AC unit to get started.</p>
      </CardContent>
    </Card>
  </div>
  
  <!-- Device Detail Drawer -->
  <DeviceDrawer 
    :device-id="selectedDeviceId" 
    :open="isDrawerOpen"
    @update:open="isDrawerOpen = $event"
  />
</template>