import { ref } from 'vue';
import type { Device } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

// Authentication state
export const authToken = ref<string | null>(localStorage.getItem('ac_energy_token'));
export const currentUser = ref<any>(JSON.parse(localStorage.getItem('ac_energy_user') || 'null'));

// Login function
export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Save token and user data
    authToken.value = data.token;
    currentUser.value = data.user;
    
    localStorage.setItem('ac_energy_token', data.token);
    localStorage.setItem('ac_energy_user', JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
export function logout() {
  authToken.value = null;
  currentUser.value = null;
  localStorage.removeItem('ac_energy_token');
  localStorage.removeItem('ac_energy_user');
}

// Helper function for authenticated API requests
async function authFetch(url: string, options: RequestInit = {}) {
  if (!authToken.value) {
    throw new Error('Authentication required');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authToken.value}`,
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    logout();
    throw new Error('Authentication expired');
  }
  
  return response;
}

// Get all devices
export async function getDevices() {
  const response = await authFetch(`${API_URL}/devices`);
  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }
  return await response.json() as Device[];
}

// Get a single device
export async function getDevice(id: number) {
  const response = await authFetch(`${API_URL}/devices/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch device ${id}`);
  }
  return await response.json() as Device;
}

// Update a device
export async function updateDevice(id: string, updates: Partial<Device>) {
  const response = await authFetch(`${API_URL}/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to update device ${id}`);
  }
  return await response.json() as Device;
}

// Toggle device power
export async function togglePower(id: string, status: 'on' | 'off') {
  // First update the device normally
  await updateDevice(id, { status });
  
  // Then trigger the power change simulation
  const response = await authFetch(`${API_URL}/simulate/power-change/${id}`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Failed to simulate power change for device ${id}`);
  }
  return await response.json();
}

// Update device usage
export async function updateUsage(id: string, currentUsage: number) {
  // First update the device normally
  await updateDevice(id, { currentUsage });
  
  // Then trigger the usage simulation
  const response = await authFetch(`${API_URL}/simulate/usage-update/${id}`, {
    method: 'POST',
    body: JSON.stringify({ currentUsage }),
  });
  if (!response.ok) {
    throw new Error(`Failed to simulate usage update for device ${id}`);
  }
  return await response.json();
}

// WebSocket events handler
export function setupEventSource(onEvent: (event: any) => void) {
  if (!authToken.value) {
    throw new Error('Authentication required');
  }
  
  // Use WebSocket
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/events';
  const socket = new WebSocket(wsUrl);
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (error) {
      console.error('Error parsing event data:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket.close();
    // Try to reconnect after 5 seconds
    setTimeout(() => setupEventSource(onEvent), 5000);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    // Try to reconnect after 5 seconds
    setTimeout(() => setupEventSource(onEvent), 5000);
  };
  
  // Return cleanup function
  return () => {
    socket.close();
  };
}