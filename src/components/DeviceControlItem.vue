<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDeviceStore } from '@/stores/deviceStore';
import { useUserStore } from '@/stores/userStore';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/composables/useToast';
import type { Device } from '@/types';
import { UserRole } from '@/types';

const props = defineProps<{
  device: Device
}>();

const deviceStore = useDeviceStore();
const userStore = useUserStore();
const toast = useToast();

const parentControlled = ref(props.device.parentControlled);
const dailyLimit = ref(props.device.dailyLimit || 120); // Default 2 hours
const isOn = ref(props.device.isOn);

// Check if user has permission to control this device
const hasControlPermission = computed(() => {
  // Admin and parent users can control any device
  if (userStore.isAdmin || userStore.isParent) return true;

  // Child users can only control non-parent-controlled devices
  return !props.device.parentControlled;
});

const toggleParentControl = async () => {
  // Only admin and parent users can toggle parent control
  if (!userStore.hasPermission([UserRole.Admin, UserRole.Parent])) {
    toast.error('Only parents or administrators can change parent control settings');
    return;
  }

  parentControlled.value = !parentControlled.value;
  try {
    await deviceStore.updateDeviceSettings(props.device.id, {
      parentControlled: parentControlled.value
    });
    toast.success(`Parent control ${parentControlled.value ? 'enabled' : 'disabled'}`);
  } catch (error) {
    toast.error('Failed to update parent control setting');
    // Revert the UI state on error
    parentControlled.value = !parentControlled.value;
  }
};

const updateDailyLimit = async () => {
  // Only admin and parent users can update daily limits
  if (!userStore.hasPermission([UserRole.Admin, UserRole.Parent])) {
    toast.error('Only parents or administrators can change usage limits');
    return;
  }

  try {
    await deviceStore.updateDeviceSettings(props.device.id, {
      dailyLimit: dailyLimit.value
    });
    toast.success(`Daily limit updated to ${dailyLimit.value} minutes`);
  } catch (error) {
    toast.error('Failed to update daily limit');
  }
};

const forceToggleDevice = async () => {
  // Check permission
  if (!hasControlPermission.value) {
    toast.error('You do not have permission to control this device');
    return;
  }

  const newState = !isOn.value;
  try {
    isOn.value = newState;
    await deviceStore.toggleDevice(props.device.id, newState, true); // Force toggle
    toast.success(`Device ${newState ? 'turned on' : 'turned off'}`);
  } catch (error) {
    toast.error(`Failed to ${newState ? 'turn on' : 'turn off'} device`);
    // Revert the UI state on error
    isOn.value = !newState;
  }
};

const remainingPercentage = computed(() => {
  if (!props.device.dailyLimit) return 100;
  const used = props.device.usageHours;
  const limit = props.device.dailyLimit;
  return Math.max(0, Math.min(100, 100 - Math.round((used / limit) * 100)));
});

const remainingTimeFormatted = computed(() => {
  if (!props.device.remainingTime) return "0h 0m";
  const hours = Math.floor(props.device.remainingTime / 60);
  const minutes = props.device.remainingTime % 60;
  return `${hours}h ${minutes}m`;
});
</script>

<template>
  <div class="border rounded-lg p-4 space-y-3 mb-4">
    <div class="flex justify-between items-center">
      <div>
        <h4 class="font-medium">{{ device.name }}</h4>
        <p class="text-sm text-muted-foreground">{{ device.location }}</p>
      </div>
      <div class="flex items-center space-x-2">
        <div :class="`w-2 h-2 rounded-full ${device.isOn ? 'bg-green-500' : 'bg-gray-300'}`"></div>
        <span class="text-xs">{{ device.isOn ? 'On' : 'Off' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2 flex flex-col justify-between ">
        <div class="flex justify-between items-center">
          <label class="text-sm">Parent Control</label>
          <Switch
            :checked="parentControlled"
            :model-value="parentControlled"
            @update:model-value="toggleParentControl"
            :disabled="!userStore.hasPermission([UserRole.Admin, UserRole.Parent])"
          />
        </div>

        <div class="flex justify-between items-center">
          <label class="text-sm">Force Power</label>
          <Button
            size="sm"
            :variant="isOn ? 'destructive' : 'default'"
            :class="isOn ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'"
            @click="forceToggleDevice"
            :disabled="!hasControlPermission" 
          >
            {{ isOn ? 'Turn Off' : 'Turn On' }}
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-sm">Daily Limit (min)</label>
          <Input
            type="number"
            v-model="dailyLimit"
            class="w-20 h-8"
            @blur="updateDailyLimit"
            :disabled="!userStore.hasPermission([UserRole.Admin, UserRole.Parent])"
          />
        </div>

        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span>Remaining: {{ remainingTimeFormatted }}</span>
            <span>{{ remainingPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-primary h-2.5 rounded-full"
              :style="{ width: `${remainingPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>