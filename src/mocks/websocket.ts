import { ws } from 'msw'
import type { Device } from '@/types'
import { mockDevices } from './handlers'
import { broadcastUpdate, setupBroadcastListener } from './broadcastChannel'

// Connect to the events endpoint - use relative URL for both development and production
const eventsWebSocket = ws.link('/events')

// Clients connected to this instance
const clients = new Set<any>()

// Setup broadcast listener to receive updates from other tabs
setupBroadcastListener((event) => {
  if (event.type === 'device_update') {
    // Update local device and broadcast to all clients in this instance
    const updatedDevice = event.data
    syncMockDevice(updatedDevice, false) // Update without rebroadcasting
    
    // Notify all connected clients
    broadcastToClients({
      type: 'device_update',
      device: updatedDevice,
      timestamp: new Date().toISOString()
    })
  }
})

// WebSocket event handlers
export const webSocketHandlers = [
  eventsWebSocket.addEventListener('connection', ({ client }) => {
    console.log('WebSocket client connected to events endpoint')
    clients.add(client)
    
    // Start the device simulation
    startEventSimulation(client)
    
    // Send initial device state
    client.send(JSON.stringify({
      type: 'initial_state',
      devices: mockDevices,
      timestamp: new Date().toISOString()
    }))
  }),
]

// Broadcast to all connected clients in this instance
function broadcastToClients(message: any) {
  const messageStr = JSON.stringify(message)
  clients.forEach(client => {
    try {
      client.send(messageStr)
    } catch (e) {
      // Client might be disconnected
      clients.delete(client)
    }
  })
}

// Simulate events for connected devices
function startEventSimulation(client: any) {
  // Simulate a temperature change every 10-30 seconds
  const temperatureInterval = setInterval(() => {
    if (mockDevices.length === 0) return
    
    const randomDeviceIndex = Math.floor(Math.random() * mockDevices.length)
    const device = mockDevices[randomDeviceIndex]
    
    // Only simulate events for devices that are on
    if (device.status === 'on') {
      // Random temperature fluctuation between -1 and +1 degrees
      const tempChange = (Math.random() * 2 - 1) * 0.5
      const newTemp = Math.round((device.temperature + tempChange) * 10) / 10
      
      // Update the device
      device.temperature = newTemp
      
      // Broadcast to all tabs
      broadcastUpdate('device_update', device)
      
      // Send the event to the client
      client.send(JSON.stringify({
        type: 'temperature_change',
        deviceId: device.id,
        temperature: newTemp,
        timestamp: new Date().toISOString()
      }))
    }
  }, 10000 + Math.random() * 20000) // Random interval between 10-30 seconds
  
  // Simulate usage updates every minute
  const usageInterval = setInterval(() => {
    mockDevices.forEach(device => {
      if (device.status === 'on') {
        // Increment usage by approximately 1 minute
        device.currentUsage += 1
        
        // Broadcast to all tabs
        broadcastUpdate('device_update', device)
        
        // Send the usage update event
        client.send(JSON.stringify({
          type: 'usage_update',
          deviceId: device.id,
          currentUsage: device.currentUsage,
          timestamp: new Date().toISOString()
        }))
        
        // Check if usage limit reached
        if (device.currentUsage >= device.dailyLimit) {
          // Turn off the device
          device.status = 'off'
          
          // Broadcast to all tabs
          broadcastUpdate('device_update', device)
          
          // Send shutdown event
          client.send(JSON.stringify({
            type: 'auto_shutdown',
            deviceId: device.id,
            reason: 'usage_limit_reached',
            timestamp: new Date().toISOString()
          }))
        }
      }
    })
  }, 60000) // Every minute
  
  // Handle client closure
  client.addEventListener('close', () => {
    clients.delete(client)
    clearInterval(temperatureInterval)
    clearInterval(usageInterval)
    console.log('WebSocket client disconnected from events endpoint')
  })
}

// Add or update a device in the mock data and broadcast to other tabs
export function updateMockDevice(device: Device) {
  syncMockDevice(device, true)
  return device
}

// Internal function to update device with broadcast control
function syncMockDevice(device: Device, shouldBroadcast = true) {
  const index = mockDevices.findIndex(d => d.id === device.id)
  if (index !== -1) {
    mockDevices[index] = device
  } else {
    mockDevices.push(device)
  }
  
  // Broadcast to other tabs if needed
  if (shouldBroadcast) {
    broadcastUpdate('device_update', device)
  }
  
  return device
}