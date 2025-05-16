import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Device, UsageRecord } from '@/types';
import { useWebSocketStore } from './webSocketStore';
import { useUserStore } from './userStore';

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([]);
  const usageHistory = ref<UsageRecord[]>([]);
  const webSocketStore = useWebSocketStore();
  const userStore = useUserStore();
  
  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      devices.value = data;
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };
  
  // Toggle device on/off
  const toggleDevice = async (deviceId: string, isOn: boolean, forceToggle = false) => {
    // Check if user has permission to toggle this device
    if (!forceToggle && !canToggleDevice(deviceId)) {
      console.error('User does not have permission to toggle this device');
      return false;
    }
    
    try {
      const response = await fetch(`/api/devices/${deviceId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOn, forceToggle })
      });
      
      if (response.ok) {
        // Update local state
        const device = devices.value.find(d => d.id === deviceId);
        if (device) {
          device.isOn = isOn;
          
          // Send WebSocket message to notify other clients
          webSocketStore.sendMessage({
            type: 'device_update',
            data: { deviceId, isOn }
          });
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error toggling device:', error);
      return false;
    }
  };
  
  // Check if user has permission to toggle a device
  const canToggleDevice = (deviceId: string) => {
    // If user is a parent, they can toggle any device
    if (userStore.isParent) return true;
    
    // If user is a child, they can only toggle non-parent-controlled devices
    const device = devices.value.find(d => d.id === deviceId);
    return device && !device.parentControlled;
  };
  
  // Set temperature for a device
  const setDeviceTemperature = async (deviceId: string, temperature: number) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/temperature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature })
      });
      
      if (response.ok) {
        // Update local state
        const device = devices.value.find(d => d.id === deviceId);
        if (device) {
          device.temperature = temperature;
          
          // Send WebSocket message to notify other clients
          webSocketStore.sendMessage({
            type: 'device_update',
            data: { deviceId, temperature }
          });
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error setting device temperature:', error);
      return false;
    }
  };

  // Update device settings
  const updateDeviceSettings = async (deviceId: string, settings: Partial<Device>) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Update local state
        const device = devices.value.find(d => d.id === deviceId);
        if (device) {
          // Update device properties
          Object.assign(device, settings);
          
          // Send WebSocket message to notify other clients
          webSocketStore.sendMessage({
            type: 'device_update',
            data: { deviceId, ...settings }
          });
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating device settings:', error);
      return false;
    }
  };
  
  // Set time limit for a device
  const setDeviceTimeLimit = async (deviceId: string, limitMinutes: number) => {
    return updateDeviceSettings(deviceId, { dailyLimit: limitMinutes });
  };
  
  // Set parent control for a device
  const setParentControlled = async (deviceId: string, controlled: boolean) => {
    return updateDeviceSettings(deviceId, { parentControlled: controlled });
  };
  
  // Handle device update from WebSocket
  const updateDeviceFromWebSocket = (data: any) => {
    // Handle different event types
    switch (data.type) {
      case 'temperature_change':
        const tempDevice = devices.value.find(d => d.id === String(data.deviceId));
        if (tempDevice) {
          tempDevice.temperature = data.temperature;
        }
        break;
        
      case 'usage_update':
        const usageDevice = devices.value.find(d => d.id === String(data.deviceId));
        if (usageDevice) {
          // Convert minutes to hours for the UI
          usageDevice.usageHours = Math.round((data.currentUsage / 60) * 10) / 10;
        }
        break;
        
      case 'auto_shutdown':
        const shutdownDevice = devices.value.find(d => d.id === String(data.deviceId));
        if (shutdownDevice) {
          shutdownDevice.isOn = false;
        }
        break;
        
      case 'device_update':
        const device = devices.value.find(d => d.id === String(data.deviceId));
        if (device) {
          // Update device properties
          Object.keys(data).forEach(key => {
            if (key !== 'deviceId' && key !== 'type' && key in device) {
              (device as any)[key] = data[key];
            }
          });
        }
        break;
    }
  };


  return { 
    devices, 
    usageHistory,
    fetchDevices, 
    toggleDevice, 
    canToggleDevice,
    updateDeviceSettings,
    setDeviceTimeLimit,
    setParentControlled,
    setDeviceTemperature,
    updateDeviceFromWebSocket 
  };
});