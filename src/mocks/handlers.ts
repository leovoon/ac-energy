import { http, HttpResponse } from 'msw'
import { updateMockDevice } from './websocket'
import type { UsageRecord, Device } from '@/types'

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    username: 'parent',
    password: 'parent123',
    name: 'Parent User',
    role: 'parent'
  },
  {
    id: 3,
    username: 'child',
    password: 'child123',
    name: 'Child User',
    role: 'child'
  }
]

// Store all active device data
export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Living Room AC',
    status: 'on',
    temperature: 22,
    mode: 'cool',
    fanSpeed: 'medium',
    dailyLimit: 240, // 4 hours in minutes
    parentControlled: true,
    usageHours: 2.1,
    currentUsage: 2.1,
    remainingTime: 40,
    isOn: true,
    location: 'Living Room'
  },
  {
    id: '2',
    name: 'Bedroom AC',
    status: 'off',
    temperature: 24,
    mode: 'heat',
    currentUsage: 0.75,
    fanSpeed: 'low',
    dailyLimit: 180, // 3 hours in minutes
    parentControlled: false,
    usageHours: 0.75,
    remainingTime: 120,
    isOn: false,
    location: 'Bedroom'
  },
  {
    id: '3',
    name: 'Kitchen AC',
    status: 'on',
    temperature: 21,
    mode: 'cool',
    currentUsage: 1.5,
    fanSpeed: 'high',
    dailyLimit: 120, // 2 hours in minutes
    parentControlled: true,
    usageHours: 1.5,
    remainingTime: 90,
    isOn: true,
    location: 'Kitchen'
  }
]


const mockUsageHistory: UsageRecord[] = [
  {
    id: 1,
    deviceId: '1',
    date: '2025-05-15',
    hoursUsed: 5.2,
    energyConsumed: 3.8
  },
  {
    id: 2,
    deviceId: '2',
    date: '2025-05-14',
    hoursUsed: 4.5,
    energyConsumed: 3.2
  },
  {
    id: 3,
    deviceId: '1',
    date: '2025-05-13',
    hoursUsed: 6.1,
    energyConsumed: 4.5
  },
  {
    id: 4,
    deviceId: '1',
    date: '2025-05-12',
    hoursUsed: 3.8,
    energyConsumed: 2.9
  },
  {
    id: 5,
    deviceId: '1',
    date: '2025-05-11',
    hoursUsed: 2.1,
    energyConsumed: 1.5
  },
  {
    id: 6,
    deviceId: '1',
    date: '2025-05-10',
    hoursUsed: 4.9,
    energyConsumed: 3.6
  },
  {
    id: 7,
    deviceId: '1',
    date: '2025-05-09',
    hoursUsed: 5.5,
    energyConsumed: 4.1
  },
  {
    id: 8,
    deviceId: '2',
    date: '2025-05-15',
    hoursUsed: 2.1,
    energyConsumed: 1.4
  },
  {
    id: 9,
    deviceId: '2',
    date: '2025-05-14',
    hoursUsed: 3.2,
    energyConsumed: 2.1
  },
  {
    id: 10,
    deviceId: '2',
    date: '2025-05-13',
    hoursUsed: 4,
    energyConsumed: 2.8
  },
  {
    id: 11,
    deviceId: '3',
    date: '2025-05-15',
    hoursUsed: 3.5,
    energyConsumed: 2.6
  },
  {
    id: 12,
    deviceId: '3',
    date: '2025-05-14',
    hoursUsed: 2.8,
    energyConsumed: 2
  },
  {
    id: 13,
    deviceId: '3',
    date: '2025-05-13',
    hoursUsed: 1.5,
    energyConsumed: 1.1
  }
]

// Generate a mock JWT token
function generateToken(userId: number): string {
  return `mock-jwt-token-for-user-${userId}-${Date.now()}`
}

export const httpHandlers = [
  // Login endpoint
  http.post('/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as { username: string; password: string }
    const user = mockUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
      })
    }

    return HttpResponse.json({
      token: generateToken(user.id),
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    })
  }),

  // Get all devices
  http.get('/api/devices', () => {
    return HttpResponse.json(mockDevices)
  }),

  // Get a single device
  http.get('/api/devices/:id', ({ params }) => {
    const id = params.id
    const device = mockDevices.find(d => d.id === id)

    if (!device) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    return HttpResponse.json(device)
  }),

  // Update a device
  http.patch('/api/devices/:id', async ({ params, request }) => {
    const id = params.id
    const updates = await request.json()
    const deviceIndex = mockDevices.findIndex(d => d.id === id)

    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    mockDevices[deviceIndex] = { ...mockDevices[deviceIndex], ...updates as Partial<Device> }
    const updatedDevice = mockDevices[deviceIndex]

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(updatedDevice)

    return HttpResponse.json(updatedDevice)
  }),

  http.patch('/api/devices/:id/settings', async ({ params, request }) => {
    const id = params.id
    const updates = await request.json()
    const deviceIndex = mockDevices.findIndex(d => d.id === id)

    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    mockDevices[deviceIndex] = { ...mockDevices[deviceIndex], ...updates as Partial<Device> }
    const updatedDevice = mockDevices[deviceIndex]

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(updatedDevice)

    return HttpResponse.json(updatedDevice)
  }),

  // Update a device toggle
  http.post('/api/devices/:id/toggle', async ({ params, request }) => {
    const id = params.id
    const { isOn } = await request.json() as { isOn: boolean; forceToggle?: boolean }
    const deviceIndex = mockDevices.findIndex(d => d.id === id)

    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }


    // Update the device status
    mockDevices[deviceIndex].status = isOn ? 'on' : 'off'

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(mockDevices[deviceIndex])

    return HttpResponse.json({
      message: `Device ${id} toggled to ${isOn ? 'on' : 'off'}`,
      device: mockDevices[deviceIndex]
    })
  }),

  http.patch('/api/devices/:id/temperature', async ({ params, request }) => {
    const id = params.id
    const { temperature } = await request.json() as { temperature: number }
    console.log(temperature, id)
    
    if (typeof temperature !== 'number' || temperature < 16 || temperature > 30) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid temperature value (must be between 16-30°C)' }), {
        status: 400,
      })
    }
    const deviceIndex = mockDevices.findIndex(d => d.id === id)


    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    // Update the device temperature
    mockDevices[deviceIndex].temperature = temperature

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(mockDevices[deviceIndex])

    return HttpResponse.json({
      message: `Device ${id} temperature set to ${temperature}°C`,
      device: mockDevices[deviceIndex]
    })
  }),

  http.patch('/api/devices/:id/parent-control', async ({ params, request }) => {
    const id = params.id
    const { parentControlled } = await request.json() as { parentControlled: boolean }
    const deviceIndex = mockDevices.findIndex(d => d.id === id)

    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    mockDevices[deviceIndex].parentControlled = parentControlled
    const updatedDevice = mockDevices[deviceIndex]

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(updatedDevice)

    return HttpResponse.json(updatedDevice)
  }),


  // Simulate usage update
  http.post('/api/simulate/usage-update/:id', async ({ params, request }) => {
    const id = params.id
    const { currentUsage } = await request.json() as { currentUsage: number }
    const deviceIndex = mockDevices.findIndex(d => d.id === id)

    if (deviceIndex === -1) {
      return new HttpResponse(JSON.stringify({ error: 'Device not found' }), {
        status: 404,
      })
    }

    // Update the device usage
    mockDevices[deviceIndex].currentUsage = currentUsage

    // Update device in WebSocket mock data to keep it in sync
    updateMockDevice(mockDevices[deviceIndex])

    return HttpResponse.json({
      message: `Device ${id} usage updated to ${currentUsage} minutes`,
      device: mockDevices[deviceIndex]
    })
  }),

  // Get usage history for a device
  http.get('/api/devices/:id/usage-history', ({ params }) => {
    const id = params.id
    const deviceHistory = mockUsageHistory.filter(d => d.deviceId === id)

    if (deviceHistory.length === 0) {
      return HttpResponse.json([])
    }

    return HttpResponse.json(deviceHistory)
  })
]