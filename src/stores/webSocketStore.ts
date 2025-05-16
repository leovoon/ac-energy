import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WebSocketMessage } from '@/types';
import { useDeviceStore } from './deviceStore';

export const useWebSocketStore = defineStore('webSocket', () => {
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);
  
  // Connect to WebSocket server
  const connect = () => {
    try {
      // Use secure WebSocket on production
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      // Connect directly to /events without any proxy
      const socketUrl = `${protocol}//${host}/events`;
      
      socket.value = new WebSocket(socketUrl);
      
      socket.value.onopen = () => {
        isConnected.value = true;
        connectionError.value = null;
        console.log('WebSocket connection established');
      };
      
      socket.value.onmessage = (event) => {
        handleWebSocketMessage(event);
      };
      
      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error);
        connectionError.value = 'Connection error';
      };
      
      socket.value.onclose = () => {
        isConnected.value = false;
        console.log('WebSocket connection closed');
        // Try to reconnect after a delay
        setTimeout(() => {
          if (!isConnected.value) connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      connectionError.value = 'Failed to connect';
    }
  };
  
  // Send message through WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  };
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const deviceStore = useDeviceStore();
      
      // Pass the parsed data directly to the device store
      // The device store will handle different message types
      deviceStore.updateDeviceFromWebSocket(data);
      
      // Log for debugging
      console.log('WebSocket message received:', data.type);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };
  
  // Disconnect WebSocket
  const disconnect = () => {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
      isConnected.value = false;
    }
  };
  
  return { 
    isConnected, 
    connectionError, 
    connect, 
    disconnect, 
    sendMessage 
  };
});