// This file simulates a Server-Sent Events (SSE) connection

import type { Device } from '@/types'

// Store for connected clients
const eventListeners: ((data: any) => void)[] = []

// Register a new client
export function registerEventListener(callback: (data: any) => void) {
  eventListeners.push(callback)
  return () => {
    const index = eventListeners.indexOf(callback)
    if (index !== -1) {
      eventListeners.splice(index, 1)
    }
  }
}

// Broadcast an event to all clients
export function broadcastEvent(event: any) {
  eventListeners.forEach(listener => listener(event))
}

// Simulate random device events
export function startEventSimulation(devices: Device[]) {
  // Simulate a temperature change every 10-30 seconds
  setInterval(() => {
    if (devices.length === 0) return
    
    const randomDeviceIndex = Math.floor(Math.random() * devices.length)
    const device = devices[randomDeviceIndex]
    
    // Only simulate events for devices that are on
    if (device.status === 'on') {
      // Random temperature fluctuation between -1 and +1 degrees
      const tempChange = (Math.random() * 2 - 1) * 0.5
      const newTemp = Math.round((device.temperature + tempChange) * 10) / 10
      
      // Update the device
      device.temperature = newTemp
      
      // Broadcast the event
      broadcastEvent({
        type: 'temperature_change',
        deviceId: device.id,
        temperature: newTemp,
        timestamp: new Date().toISOString()
      })
    }
  }, 10000 + Math.random() * 20000) // Random interval between 10-30 seconds
  
  // Simulate usage updates every minute
  setInterval(() => {
    devices.forEach(device => {
      if (device.status === 'on') {
        // Increment usage by approximately 1 minute
        device.currentUsage += 1
        
        // Broadcast the event
        broadcastEvent({
          type: 'usage_update',
          deviceId: device.id,
          currentUsage: device.currentUsage,
          timestamp: new Date().toISOString()
        })
        
        // Check if usage limit reached
        if (device.currentUsage >= device.dailyLimit) {
          // Turn off the device
          device.status = 'off'
          
          // Broadcast shutdown event
          broadcastEvent({
            type: 'auto_shutdown',
            deviceId: device.id,
            reason: 'usage_limit_reached',
            timestamp: new Date().toISOString()
          })
        }
      }
    })
  }, 60000) // Every minute
}