<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ref, computed, watch } from "vue";
import type { Device } from "@/types";

const props = defineProps<{
  device: Device
}>();

defineEmits<{
  'view-details': [deviceId: string];
}>();

const isOn = ref(props.device.isOn);

watch(() => props.device.isOn, (newValue) => {
  isOn.value = newValue;
});


// Get appropriate status colors and text
const statusColor = computed(() => {
  return isOn.value ? 'bg-green-500' : 'bg-gray-300';
});


// Calculate usage percentage
const usagePercentage = computed(() => {
  if (!props.device.dailyLimit) return 0;
  return Math.min(100, Math.round((props.device.usageHours / props.device.dailyLimit) * 100));
});
</script>

<template>
  <Card class="h-full cursor-pointer hover:shadow-md transition-shadow" @click="$emit('view-details', String(device.id))" tabindex="0" role="button">
    <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
      <CardTitle class="text-base font-semibold">{{ device.name }}</CardTitle>
      <div class="flex flex-col items-end space-y-2">
        <Badge v-if="device.parentControlled" variant="secondary" class="text-xs">
          Parent Controlled
        </Badge>
        <Badge variant="outline" class="text-xs">{{ device.location }}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-2">
          <div :class="`w-3 h-3 rounded-full ${statusColor}`"></div>
          <p class="text-sm">{{ isOn ? 'Running' : 'Off' }}</p>
        </div>
       
      </div>
      
      <div class="grid grid-cols-2 gap-3 mt-2">
        <div class="text-center p-2 bg-muted rounded-md">
          <p class="text-xs text-muted-foreground mb-1">Temperature</p>
          <p class="text-lg font-semibold">{{ device.temperature }}°C</p>
        </div>
        
        <div class="text-center p-2 bg-muted rounded-md">
          <p class="text-xs text-muted-foreground mb-1">Daily Limit</p>
          <p class="text-sm font-medium">{{ usagePercentage }}% used</p>
        </div>
      </div>
    </CardContent>
    <CardFooter class="pt-2">
      <Button variant="ghost" class="w-full text-primary" size="sm">
        View Details
      </Button>
    </CardFooter>
  </Card>
</template>