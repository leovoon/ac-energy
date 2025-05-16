import { defineStore } from 'pinia';
import { ref, computed,  } from 'vue';
import {
  getDevices,
  updateDevice,
  togglePower,
  updateUsage,
  setupEventSource
} from './api';
import type { Device } from '@/types';

export const useDeviceStore = defineStore('devices', () => {
  const devices = ref<Device[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const connected = ref(false);
  const eventCleanup = ref<(() => void) | null>(null);

  // Getters
  const activeDevices = computed(() => 
    devices.value.filter(device => device.status === 'on')
  );
  
  const getDeviceById = (id: string) => 
    devices.value.find(device => device.id === id);

  // Actions
  async function fetchDevices() {
    loading.value = true;
    error.value = null;
    try {
      devices.value = await getDevices();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch devices';
      console.error('Error fetching devices:', err);
    } finally {
      loading.value = false;
    }
  }

  async function updateDeviceSettings(id: string, updates: Partial<Device>) {
    try {
      const updatedDevice = await updateDevice(id, updates);
      const index = devices.value.findIndex(d => d.id === id);
      if (index !== -1) {
        devices.value[index] = updatedDevice;
      }
      return updatedDevice;
    } catch (err: any) {
      error.value = err.message || 'Failed to update device';
      console.error('Error updating device:', err);
      throw err;
    }
  }

  async function toggleDevicePower(id: string, status: 'on' | 'off') {
    try {
      await togglePower(id, status);
      // The actual update will come through WebSocket events
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle device power';
      console.error('Error toggling device power:', err);
      throw err;
    }
  }

  async function simulateUsageUpdate(id: string, usage: number) {
    try {
      await updateUsage(id, usage);
      // The actual update will come through WebSocket events
    } catch (err: any) {
      error.value = err.message || 'Failed to update device usage';
      console.error('Error updating device usage:', err);
      throw err;
    }
  }

  // WebSocket event handling
  function connectToEvents() {
    if (eventCleanup.value) {
      eventCleanup.value();
    }

    try {
      eventCleanup.value = setupEventSource((event) => {
        connected.value = true;

        if (event.type === 'power-change') {
          handlePowerChangeEvent(event);
        } else if (event.type === 'usage-alert') {
          handleUsageAlertEvent(event);
        }
      });
    } catch (err: any) {
      connected.value = false;
      error.value = err.message || 'Failed to connect to event source';
      console.error('Error connecting to events:', err);
    }
  }

  function disconnectFromEvents() {
    if (eventCleanup.value) {
      eventCleanup.value();
      eventCleanup.value = null;
    }
    connected.value = false;
  }

  function handlePowerChangeEvent(event: any) {
    const { deviceId, status } = event;
    const index = devices.value.findIndex(d => d.id === deviceId);
    
    if (index !== -1) {
      devices.value[index] = {
        ...devices.value[index],
        status
      };
    }
  }

  function handleUsageAlertEvent(event: any) {
    const { deviceId, currentUsage, alertLevel } = event;
    const index = devices.value.findIndex(d => d.id === deviceId);
    
    if (index !== -1) {
      devices.value[index] = {
        ...devices.value[index],
        currentUsage
      };
      
      // You could implement alerts/notifications here
      console.log(`Device ${deviceId} reached ${alertLevel}% of usage limit`);
    }
  }

  return {
    devices,
    loading,
    error,
    connected,
    activeDevices,
    getDeviceById,
    fetchDevices,
    updateDeviceSettings,
    toggleDevicePower,
    simulateUsageUpdate,
    connectToEvents,
    disconnectFromEvents
  };
});