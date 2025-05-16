import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UsageRecord } from '@/types';

export const useUsageHistoryStore = defineStore('usageHistory', () => {
  // State
  const usageHistory = ref<UsageRecord[]>([]);
  const isLoading = ref(false);
  const timeRange = ref<'week' | 'month' | 'year'>('week');
  
  /**
   * Fetch usage history for a specific device
   */
  const fetchDeviceHistory = async (deviceId: string | number) => {
    isLoading.value = true;
    try {
      const response = await fetch(`/api/devices/${deviceId}/usage-history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      usageHistory.value = data;
      return data;
    } catch (error) {
      console.error('Error fetching device usage history:', error);
      
      return usageHistory.value;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Get filtered history based on selected time range
   */
  const filteredHistory = computed(() => {
    const now = new Date();
    let filterDate = new Date();
    
    switch (timeRange.value) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setDate(now.getDate() - 7);
    }
    
    return usageHistory.value.filter(record => {
      return new Date(record.date) >= filterDate;
    });
  });

  /**
   * Get chart-ready data for visualization
   */
  const chartData = computed(() => {
    // Sort by date to ensure chronological order
    const sortedData = [...filteredHistory.value].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    const result = sortedData.map((record) => ({
      name: formatDate(record.date),
      hoursUsed: record.hoursUsed,
      energyConsumed: record.energyConsumed
    }));
    
    return result;
  });

  /**
   * Calculate total hours used in the current filtered period
   */
  const totalHours = computed(() => {
    return filteredHistory.value.reduce((sum, record) => sum + record.hoursUsed, 0).toFixed(1);
  });

  /**
   * Calculate total energy consumed in the current filtered period
   */
  const totalEnergy = computed(() => {
    return filteredHistory.value.reduce((sum, record) => sum + record.energyConsumed, 0).toFixed(1);
  });

  /**
   * Set the time range for filtering data
   */
  const setTimeRange = (range: 'week' | 'month' | 'year') => {
    timeRange.value = range;
  };

  return { 
    usageHistory,
    isLoading,
    timeRange,
    fetchDeviceHistory,
    formatDate,
    filteredHistory,
    chartData,
    totalHours,
    totalEnergy,
    setTimeRange
  };
});