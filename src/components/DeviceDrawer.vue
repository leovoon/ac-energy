<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useDeviceStore } from '@/stores/deviceStore';
import { useUsageHistoryStore } from '@/stores/usageHistoryStore';
import CountdownTimer from './CountdownTimer.vue';
import type { Device } from '@/types';

const props = defineProps<{
  deviceId: string | null;
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const router = useRouter();
const deviceStore = useDeviceStore();
const usageHistoryStore = useUsageHistoryStore();

const device = ref<Device | null>(null);
const isOn = ref(false);
const startTime = ref<Date>(new Date());
const deviceMode = ref<string>('Normal');

// Watch for changes to our local state and emit events back to parent
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value);
  }
});

watchEffect(() => {
  // Only update the device if the drawer is open and we have a device ID
  if (props.open && props.deviceId) {
    const foundDevice = deviceStore.devices.find(d => d.id === props.deviceId);
    device.value = foundDevice || null;
    if (foundDevice) {
      isOn.value = foundDevice.isOn;
      startTime.value = new Date(Date.now() - (foundDevice.usageHours * 60 * 60 * 1000 / 24));
      deviceMode.value = foundDevice.temperature <= 21 ? 'Eco' : 
                     foundDevice.temperature >= 25 ? 'Comfort' : 'Normal';
      
      // Fetch usage history data for this device
      usageHistoryStore.fetchDeviceHistory(foundDevice.id);
    }
  } else if (!props.open) {
    // Reset device when drawer is closed
    setTimeout(() => {
      device.value = null;
    }, 300); // Wait for animation to complete
  }
});

const canToggle = ref(false);
watchEffect(() => {
  if (device.value) {
    canToggle.value = deviceStore.canToggleDevice(device.value.id) || false;
  }
});

const toggleDevice = async () => {
  console.log('toggleDevice');
  if (!device.value || !canToggle.value) return;

  const newState = !isOn.value;
  isOn.value = newState;

  // Make sure we pass the correct type by explicitly setting the third parameter
  await deviceStore.toggleDevice(device.value.id, newState, false as boolean);
};

const adjustTemperature = async (change: number) => {
  if (!device.value) return;
  
  // Calculate new temperature within bounds (16-30°C)
  const newTemp = Math.min(30, Math.max(16, device.value.temperature + change));
  
  // Update the device temperature via the store
  await deviceStore.setDeviceTemperature(device.value.id, newTemp);
};

const viewDetails = () => {
  if (device.value) {
    // First close the drawer by emitting the update event
    emit('update:open', false);
    // Then navigate to the device details page
    router.push({ name: 'device-details', params: { id: device.value.id } });
  }
};

// Format daily usage limit
const dailyLimitFormatted = (dailyLimit?: number) => {
  if (!dailyLimit) return "No limit";
  const hours = Math.floor(dailyLimit / 60);
  const minutes = dailyLimit % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Calculate usage percentage
const usagePercentage = (usageHours?: number, dailyLimit?: number) => {
  if (!usageHours || !dailyLimit) return 0;
  return Math.min(100, Math.round((usageHours / dailyLimit) * 100));
};
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="m-auto max-w-lg">
      <div v-if="device">
        <DrawerHeader>
          <DrawerTitle>{{ device.name }}</DrawerTitle>
          <DrawerDescription>
            <div class="flex items-center space-x-2">
              <Badge>{{ device.location }}</Badge>
              <Badge v-if="device.parentControlled" variant="secondary">Parent Controlled</Badge>
            </div>
          </DrawerDescription>
        </DrawerHeader>

        <div class="p-4 pt-0">
          <div class="grid gap-4 py-4">
            <!-- Status section with enhanced info -->            
            <div class="bg-muted p-3 rounded-lg">
              <div class="flex items-center space-x-4 mb-2">
                <div :class="`w-3 h-3 rounded-full ${device.isOn ? 'bg-green-500' : 'bg-gray-300'}`"></div>
                <span>{{ device.isOn ? 'Running' : 'Off' }}</span>
                <div class="ml-auto">
                  <Switch
                    :checked="isOn"
                    @update:modelValue="toggleDevice"
                    :modelValue="isOn"
                    :disabled="!canToggle"
                  />
                </div>
              </div>
              <!-- Runtime information (only visible in drawer) -->
              <div v-if="device.isOn" class="text-xs text-muted-foreground">
                <p>Running since: {{ startTime.toLocaleTimeString() }}</p>
                <p>Mode: {{ deviceMode }}</p>
              </div>
            </div>

            <!-- Temperature section with comfort rating -->            
            <div class="space-y-1 bg-muted p-3 rounded-lg">
              <p class="text-sm font-medium">Temperature</p>
              <div class="flex items-center space-x-2">
                <p class="text-2xl font-bold">{{ device.temperature }}°C</p>
                <!-- Comfort indicator (only visible in drawer) -->
                <Badge :variant="device.temperature < 19 ? 'secondary' : (device.temperature > 25 ? 'destructive' : 'default')">
                  {{ device.temperature < 19 ? 'Cool' : (device.temperature > 25 ? 'Warm' : 'Comfortable') }}
                </Badge>
                <div class="ml-auto space-x-2">
                  <Button size="sm" variant="outline" @click="adjustTemperature(-1)" :disabled="device.temperature <= 16">
                    <span class="text-lg">-</span>
                  </Button>
                  <Button size="sm" variant="outline" @click="adjustTemperature(1)" :disabled="device.temperature >= 30">
                    <span class="text-lg">+</span>
                  </Button>
                </div>
              </div>
            </div>

            <!-- Usage section with visualization -->
            <div class="space-y-2 bg-muted p-3 rounded-lg">
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium">Daily Limit</p>
                <p>{{ dailyLimitFormatted(device.dailyLimit) }}</p>
              </div>
              
              <div v-if="device.isOn && device.remainingTime > 0" class="space-y-1">
                <div class="flex justify-between text-xs">
                  <p class="text-sm font-medium">Time Remaining</p>
                  <span>{{ usagePercentage(device.usageHours, device.dailyLimit) }}% used</span>
                </div>
                <CountdownTimer :seconds="device.remainingTime" />
              </div>
              
              <!-- Daily energy consumption estimate (only visible in drawer) -->
              <div class="mt-2 text-xs border-t pt-2 border-muted-foreground/20">
                <p>Estimated energy today: {{ (device.usageHours * 1.5).toFixed(1) }} kWh</p>
                <p>Cost today: ${{ (device.usageHours * 1.5 * 0.22).toFixed(2) }}</p>
              </div>
              
              <!-- Usage chart preview -->
              <div v-if="usageHistoryStore.chartData.length > 0" class="mt-2 text-xs">
                <p class="mb-1">Usage history (recent days):</p>
                <div class="flex h-20 gap-1 items-end">
                  <div 
                    v-for="(item, i) in usageHistoryStore.chartData.slice(0, 5)" 
                    :key="i" 
                    class="bg-primary/80 w-full rounded-t" 
                    :style="{ height: `${Math.max(10, item.hoursUsed * 4)}px` }" 
                    :title="`${item.name}: ${item.hoursUsed} hours`"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- Quick actions section (only visible in drawer) -->
            <div class="space-y-2 bg-muted p-3 rounded-lg">
              <p class="text-sm font-medium">Quick Actions</p>
              <div class="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" @click="deviceStore.setDeviceTemperature(device.id, 21)">
                  Eco Mode (21°C)
                </Button>
                <Button size="sm" variant="outline" @click="deviceStore.setDeviceTemperature(device.id, 25)">
                  Comfort Mode (25°C)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button @click="viewDetails">View Full Details</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>

      <div v-else class="p-4 text-center">
        <p>Device not found</p>
        <DrawerClose asChild>
          <Button variant="outline" class="mt-4">Close</Button>
        </DrawerClose>
      </div>
    </DrawerContent>
  </Drawer>
</template>