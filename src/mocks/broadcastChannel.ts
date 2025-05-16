// BroadcastChannel for syncing MSW mock state between browser tabs
const channel = new BroadcastChannel('ac-energy-mock-state');

// Listen for updates from other tabs
export function setupBroadcastListener(onUpdate: (data: any) => void) {
  channel.onmessage = (event) => {
    onUpdate(event.data);
  };
}

// Broadcast updates to other tabs
export function broadcastUpdate(type: string, data: any) {
  channel.postMessage({
    type,
    data,
    timestamp: Date.now()
  });
}