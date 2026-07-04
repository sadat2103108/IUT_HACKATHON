import { EventEmitter } from 'node:events';
import { createDeviceStore } from '../store/deviceStore.js';

const ROOMS = [
  { id: 'drawing', name: 'Drawing Room' },
  { id: 'work1', name: 'Work Room 1' },
  { id: 'work2', name: 'Work Room 2' }
];

const DEVICE_TEMPLATES = [
  { room: 'drawing', type: 'fan', powerRating: 60, suffix: 'fan-1' },
  { room: 'drawing', type: 'fan', powerRating: 60, suffix: 'fan-2' },
  { room: 'drawing', type: 'light', powerRating: 15, suffix: 'light-1' },
  { room: 'drawing', type: 'light', powerRating: 15, suffix: 'light-2' },
  { room: 'drawing', type: 'light', powerRating: 15, suffix: 'light-3' },
  { room: 'work1', type: 'fan', powerRating: 60, suffix: 'fan-1' },
  { room: 'work1', type: 'fan', powerRating: 60, suffix: 'fan-2' },
  { room: 'work1', type: 'light', powerRating: 15, suffix: 'light-1' },
  { room: 'work1', type: 'light', powerRating: 15, suffix: 'light-2' },
  { room: 'work1', type: 'light', powerRating: 15, suffix: 'light-3' },
  { room: 'work2', type: 'fan', powerRating: 60, suffix: 'fan-1' },
  { room: 'work2', type: 'fan', powerRating: 60, suffix: 'fan-2' },
  { room: 'work2', type: 'light', powerRating: 15, suffix: 'light-1' },
  { room: 'work2', type: 'light', powerRating: 15, suffix: 'light-2' },
  { room: 'work2', type: 'light', powerRating: 15, suffix: 'light-3' }
];

function buildInitialState() {
  const devices = {};
  DEVICE_TEMPLATES.forEach((template) => {
    const roomId = template.room;
    const deviceId = `${roomId}-${template.type}-${template.suffix.split('-').pop()}`;
    devices[deviceId] = {
      id: deviceId,
      room: getRoomName(roomId),
      type: template.type.charAt(0).toUpperCase() + template.type.slice(1),
      status: false,
      powerRating: template.powerRating,
      lastChanged: Math.floor(Date.now() / 1000)
    };
  });

  return { devices, activeAlerts: {} };
}

function getRoomName(roomId) {
  return ROOMS.find((room) => room.id === roomId)?.name || roomId;
}

function getPowerForDevice(device) {
  return device.status ? device.powerRating : 0;
}

export function createMonitoringService({ notifier } = {}) {
  const store = createDeviceStore(buildInitialState());
  const emitter = new EventEmitter();

  function emitChange() {
    emitter.emit('state:changed', store.getSnapshot());
  }

  function getSnapshot() {
    return store.getSnapshot();
  }

  function getPowerSummary() {
    const snapshot = store.getSnapshot();
    const byRoom = {};
    let total = 0;

    Object.values(snapshot.devices).forEach((device) => {
      const power = getPowerForDevice(device);
      total += power;
      byRoom[device.room] = (byRoom[device.room] || 0) + power;
    });

    return {
      total,
      byRoom: Object.fromEntries(Object.entries(byRoom).map(([room, power]) => [room, power]))
    };
  }

  function upsertDevice(devicePayload) {
    const updatedDevice = store.upsertDevice({
      id: devicePayload.deviceId || devicePayload.id,
      room: devicePayload.room,
      type: devicePayload.type,
      status: devicePayload.status,
      powerRating: devicePayload.powerRating,
      lastChanged: devicePayload.timestamp || devicePayload.lastChanged || Math.floor(Date.now() / 1000)
    });

    emitChange();
    return updatedDevice;
  }

  function syncDevices(devices) {
    const entries = Object.entries(devices || {}).reduce((acc, [deviceId, payload]) => {
      acc[deviceId] = {
        id: deviceId,
        room: payload.room,
        type: payload.type,
        status: payload.status,
        powerRating: payload.powerRating,
        lastChanged: payload.lastChanged || Math.floor(Date.now() / 1000)
      };
      return acc;
    }, {});

    store.replaceDevices(entries);
    emitChange();
    return store.getSnapshot();
  }

  function resolveAlert(alertId) {
    const alert = store.removeAlert(alertId);
    if (alert) {
      emitChange();
    }
    return alert;
  }

  function evaluateAlerts() {
    const snapshot = store.getSnapshot();
    const now = new Date();
    const hour = now.getHours();
    const isAfterHours = hour >= 17;

    const activeDevices = Object.values(snapshot.devices).filter((device) => device.status);

    const currentAlerts = snapshot.activeAlerts;

    if (isAfterHours && activeDevices.length > 0) {
      const existing = Object.values(currentAlerts).find((alert) => alert.type === 'AFTER_HOURS');
      if (!existing) {
        store.upsertAlert({
          type: 'AFTER_HOURS',
          room: activeDevices[0].room,
          message: 'Devices remain active after office hours.',
          resolved: false
        });
      }
    }

    const longRunning = activeDevices.filter((device) => {
      const durationSeconds = Math.floor((Date.now() / 1000) - (device.lastChanged || 0));
      return durationSeconds > 7200;
    });

    if (longRunning.length > 0) {
      longRunning.forEach((device) => {
        const existing = Object.values(currentAlerts).find((alert) => alert.type === 'LONG_RUNNING' && alert.room === device.room);
        if (!existing) {
          store.upsertAlert({
            type: 'LONG_RUNNING',
            room: device.room,
            message: `${getRoomName(device.room)} has a device running for over 2 hours.`,
            resolved: false
          });
        }
      });
    }

    const roomMap = Object.values(snapshot.devices).reduce((acc, device) => {
      if (!acc[device.room]) {
        acc[device.room] = [];
      }
      acc[device.room].push(device);
      return acc;
    }, {});

    Object.entries(roomMap).forEach(([roomId, devices]) => {
      const activeInRoom = devices.filter((device) => device.status);
      if (activeInRoom.length === devices.length && devices.length > 0) {
        const existing = Object.values(currentAlerts).find((alert) => alert.type === 'ROOM_FULLY_ACTIVE' && alert.room === roomId);
        if (!existing) {
          const durationSeconds = Math.floor((Date.now() / 1000) - (Math.min(...activeInRoom.map((device) => device.lastChanged || 0))) );
          if (durationSeconds > 7200) {
            store.upsertAlert({
              type: 'ROOM_FULLY_ACTIVE',
              room: roomId,
              message: `${getRoomName(roomId)} has all devices ON for more than 2 hours.`,
              resolved: false
            });
          }
        }
      }
    });

    emitChange();
    return store.getSnapshot();
  }

  async function dispatchAlert(alert) {
    if (typeof notifier === 'function') {
      try {
        await notifier(alert);
      } catch (error) {
        console.error('Alert dispatch failed:', error);
      }
    }
  }

  function handleDeviceUpdate(payload) {
    const updatedDevice = upsertDevice(payload);
    const snapshot = evaluateAlerts();

    const activeAlerts = Object.values(snapshot.activeAlerts);
    activeAlerts.forEach((alert) => {
      if (!alert.notified) {
        dispatchAlert(alert);
        alert.notified = true;
      }
    });

    return { device: updatedDevice, snapshot };
  }

  return {
    evaluateAlerts,
    getPowerSummary,
    getSnapshot,
    handleDeviceUpdate,
    on: emitter.on.bind(emitter),
    resolveAlert,
    syncDevices,
    upsertDevice
  };
}
