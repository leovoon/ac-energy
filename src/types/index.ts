export interface Device {
  id: string;
  name: string;
  location: string;
  isOn: boolean;
  status: 'on' | 'off';
  fanSpeed: 'low' | 'medium' | 'high' | 'auto';
  mode: 'cool' | 'heat' | 'dry' | 'fan';
  temperature: number;
  remainingTime: number;
  currentUsage: number;
  usageHours: number;
  dailyLimit: number;
  parentControlled?: boolean;
}

export enum UserRole {
  Admin = 'admin',
  Parent = 'parent',
  Child = 'child'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface UsageRecord {
  id?: number;
  deviceId: string | number;
  date: string;
  hoursUsed: number;
  energyConsumed: number;
}