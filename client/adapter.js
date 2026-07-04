function getApiBaseUrl() {
  if (window.location.protocol === 'file:') {
    return 'http://127.0.0.1:4000';
  }

  const origin = window.location.origin || 'http://127.0.0.1:4000';
  return origin.replace(/:\d+$/, ':4000');
}

function normalizeRoom(room) {
  const roomMap = {
    drawing: 'Drawing Room',
    work1: 'Work Room 1',
    work2: 'Work Room 2'
  };

  return roomMap[room] || room;
}

function normalizeDevice(device) {
  const roomName = normalizeRoom(device.room);
  const isFan = String(device.type).toLowerCase() === 'fan';
  const changedAt = device.changedAt || device.lastChanged
    ? new Date((device.changedAt || device.lastChanged) * 1000)
    : new Date();

  return {
    id: device.id,
    name: `${roomName} - ${isFan ? 'Fan' : 'Light'} ${String(device.id).split('-').pop()}`,
    room: roomName,
    type: isFan ? 'Fan' : 'Light',
    status: Boolean(device.status),
    wattOn: device.powerRating || 0,
    changedAt
  };
}

function normalizeAlerts(alerts = {}) {
  return Object.values(alerts).map((alert) => ({
    id: alert.id,
    room: normalizeRoom(alert.room),
    message: alert.message || 'Live alert reported by the monitoring service.',
    condition: alert.type || 'ACTIVE',
    severity: alert.type === 'AFTER_HOURS' ? 'MEDIUM' : 'HIGH',
    since: new Date(alert.createdAt || alert.updatedAt || Date.now()),
    durationMs: Date.now() - new Date(alert.createdAt || alert.updatedAt || Date.now()).getTime()
  }));
}

export function createDashboardAdapter({ onStateChange, onAlertsChange }) {
  let socket = null;

  async function refreshFromApi() {
    const baseUrl = getApiBaseUrl();
    const [stateResponse, powerResponse] = await Promise.all([
      fetch(`${baseUrl}/api/state`),
      fetch(`${baseUrl}/api/power`)
    ]);

    if (!stateResponse.ok || !powerResponse.ok) {
      throw new Error('Failed to load live dashboard data.');
    }

    const state = await stateResponse.json();
    const power = await powerResponse.json();
    const devices = Object.values(state.devices || {}).map(normalizeDevice);
    const alerts = normalizeAlerts(state.activeAlerts || {});

    onStateChange({ devices, power });
    onAlertsChange(alerts);
  }

  function connectSocket() {
    if (typeof window.io === 'undefined') {
      console.warn('Socket.IO client is unavailable; live socket updates are disabled.');
      return;
    }

    const baseUrl = getApiBaseUrl();
    socket = window.io(baseUrl, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('device:update', (payload) => {
      const devices = Object.values(payload.devices || {}).map(normalizeDevice);
      const alerts = normalizeAlerts(payload.activeAlerts || {});
      onStateChange({ devices, power: payload.power || null });
      onAlertsChange(alerts);
    });

    socket.on('power:update', (power) => {
      onStateChange({ devices: [], power });
    });

    socket.on('alert:new', (alerts) => {
      onAlertsChange(normalizeAlerts(alerts || {}));
    });
  }

  return { connectSocket, refreshFromApi };
}
