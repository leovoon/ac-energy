<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart } from '@/components/ui/chart-bar';
import { useDeviceStore } from '@/stores/deviceStore';
import { useUsageHistoryStore } from '@/stores/usageHistoryStore';
import CountdownTimer from '@/components/CountdownTimer.vue';

const route = useRoute();
const deviceStore = useDeviceStore();
const usageHistoryStore = useUsageHistoryStore();
const deviceId = computed(() => route.params.id as string);
const device = computed(() => deviceStore.devices.find(d => d.id === deviceId.value));

// Extract reactive state properties with storeToRefs
const { 
  isLoading,
  timeRange,
  chartData: filteredChartData,
  filteredHistory: filteredUsageHistory,
  totalHours,
  totalEnergy
} = storeToRefs(usageHistoryStore);

// Methods need to be destructured directly (they're not reactive)
const { formatDate, setTimeRange } = usageHistoryStore;

// Fetch device data and usage history when component mounts
onMounted(async () => {
  if (deviceStore.devices.length === 0) {
    await deviceStore.fetchDevices();
  }
  await usageHistoryStore.fetchDeviceHistory(deviceId.value);
});

// Format daily usage limit
const dailyLimitFormatted = computed(() => {
  if (!device.value?.dailyLimit) return "No limit";
  const hours = Math.floor(device.value.dailyLimit / 60);
  const minutes = device.value.dailyLimit % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Calculate usage percentage
const usagePercentage = computed(() => {
  if (!device.value?.dailyLimit) return 0;
  return Math.min(100, Math.round((device.value.usageHours / device.value.dailyLimit) * 100));
});

// Function to adjust temperature
const adjustTemperature = async (change: number) => {
  if (!device.value) return;
  
  // Calculate new temperature within bounds (16-30°C)
  const newTemp = Math.min(30, Math.max(16, device.value.temperature + change));
  
  // Update the device temperature via the store
  await deviceStore.setDeviceTemperature(device.value.id, newTemp);
};
</script>

<template>
  <div v-if="device">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ device.name }}</h1>
      <Badge>{{ device.location }}</Badge>
    </div>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-2">
            <div :class="`w-3 h-3 rounded-full ${device.isOn ? 'bg-green-500' : 'bg-gray-300'}`"></div>
            <span class="text-xl font-bold">{{ device.isOn ? 'Running' : 'Off' }}</span>
          </div>
          <div class="mt-4">
            <Button 
              :variant="device.isOn ? 'destructive' : 'default'" 
              @click="deviceStore.toggleDevice(device.id, !device.isOn)"
            >
              {{ device.isOn ? 'Turn Off' : 'Turn On' }}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Temperature</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ device.temperature }}°C</div>
          <div class="mt-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              class="px-2" 
              @click="adjustTemperature(-1)" 
              :disabled="device.temperature <= 16"
            >
              <span class="text-lg">-</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              class="px-2" 
              @click="adjustTemperature(1)" 
              :disabled="device.temperature >= 30"
            >
              <span class="text-lg">+</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Daily Usage Limit</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{{ dailyLimitFormatted }}</div>
          <div v-if="device.isOn && device.remainingTime > 0" class="mt-4">
            <div class="flex justify-between text-xs mb-1">
              <span>Time Remaining</span>
              <span>{{ usagePercentage }}% used</span>
            </div>
            <CountdownTimer :seconds="device.remainingTime" />
          </div>
        </CardContent>
      </Card>
    </div>
    
    <Card class="mb-8">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Usage History</CardTitle>
          <div>
            <div class="inline-flex items-center space-x-2">
              <span class="text-sm">Period:</span>
              <select 
                :value="timeRange" 
                @change="(e) => setTimeRange((e.target as HTMLSelectElement).value as any)" 
                class="px-2 py-1 rounded border text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <div v-else>
          <div class="h-fit mb-6">
            <BarChart
              :data="filteredChartData"
              index="name"
              :rounded-corners="8"
              :categories="['hoursUsed', 'energyConsumed']"
            />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 font-medium">Date</th>
                  <th class="text-left py-3 font-medium">Hours Used</th>
                  <th class="text-left py-3 font-medium">Energy Consumed (kWh)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in filteredUsageHistory" :key="record.date" class="border-b">
                  <td class="py-3">{{ formatDate(record.date) }}</td>
                  <td class="py-3">{{ record.hoursUsed }} hours</td>
                  <td class="py-3">{{ record.energyConsumed }} kWh</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="py-3 font-medium">Total</td>
                  <td class="py-3 font-medium">{{ totalHours }} hours</td>
                  <td class="py-3 font-medium">{{ totalEnergy }} kWh</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium mb-1">Device ID</p>
            <p class="text-muted-foreground">{{ device.id }}</p>
          </div>
          <div>
            <p class="text-sm font-medium mb-1">Location</p>
            <p class="text-muted-foreground">{{ device.location }}</p>
          </div>
          <div>
            <p class="text-sm font-medium mb-1">Parent Controlled</p>
            <p class="text-muted-foreground">{{ device.parentControlled ? 'Yes' : 'No' }}</p>
          </div>
          <div>
            <p class="text-sm font-medium mb-1">Daily Limit</p>
            <p class="text-muted-foreground">{{ dailyLimitFormatted }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  <div v-else class="p-4 text-center">
    <p>Device not found</p>
  </div>
</template>