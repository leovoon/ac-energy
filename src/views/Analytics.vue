<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from '@/components/ui/chart-area';

const selectedPeriod = ref('daily');

// For this demo, we'll show placeholder data
const usageData = ref([
  { name: 'Mon', usage: 5.2, energy: 3.8 },
  { name: 'Tue', usage: 4.8, energy: 3.5 },
  { name: 'Wed', usage: 6.1, energy: 4.2 },
  { name: 'Thu', usage: 5.5, energy: 3.9 },
  { name: 'Fri', usage: 3.9, energy: 2.8 },
  { name: 'Sat', usage: 2.8, energy: 2.1 },
  { name: 'Sun', usage: 4.3, energy: 3.2 }
]);

// Compute total usage hours
const totalUsageHours = computed(() => {
  return usageData.value.reduce((total, day) => total + day.usage, 0).toFixed(1);
});

// Compute average daily usage
const averageDailyUsage = computed(() => {
  return (usageData.value.reduce((total, day) => total + day.usage, 0) / usageData.value.length).toFixed(1);
});

// Compute most active day
const mostActiveDay = computed(() => {
  return usageData.value.reduce((max, day) => day.usage > max.usage ? day : max, usageData.value[0]).name;
});
</script>

<template>
  <div>

    <div class="mb-6">
      <div class="inline-flex rounded-md shadow-sm">
        <button
          v-for="period in ['daily', 'weekly', 'monthly']"
          :key="period"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            'border border-input',
            period === 'daily' ? 'rounded-l-md' : '',
            period === 'monthly' ? 'rounded-r-md' : '',
            selectedPeriod === period ? 'bg-primary text-primary-foreground' : 'bg-background'
          ]"
          @click="selectedPeriod = period"
        >
          {{ period.charAt(0).toUpperCase() + period.slice(1) }}
        </button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalUsageHours }} hours</div>
          <p class="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Average Daily Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ averageDailyUsage }} hours/day</div>
          <p class="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Most Active Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ mostActiveDay }}</div>
          <p class="text-xs text-muted-foreground mt-1">Last 7 days</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          :data="usageData"
          index="name"
          :categories="['usage', 'energy']"
          class="h-80"
        />
      </CardContent>
    </Card>
  </div>
</template>