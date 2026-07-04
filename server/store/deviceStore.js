import { randomUUID } from "node:crypto";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDeviceStore(initialDevices = {}) {
  const state = {
    devices: {},
    activeAlerts: {},
    updatedAt: null
  };

  function stamp() {
    state.updatedAt = new Date().toISOString();
  }

  function reset(initialState = {}) {
    state.devices = {};
    state.activeAlerts = {};

    Object.entries(initialState.devices || {}).forEach(([deviceId, device]) => {
      state.devices[deviceId] = clone(device);
    });

    Object.entries(initialState.activeAlerts || {}).forEach(([alertId, alert]) => {
      state.activeAlerts[alertId] = clone(alert);
    });

    stamp();
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      devices: clone(state.devices),
      activeAlerts: clone(state.activeAlerts),
      updatedAt: state.updatedAt
    };
  }

  function getDevice(deviceId) {
    const device = state.devices[deviceId];
    return device ? clone(device) : null;
  }

  function listDevices() {
    return Object.values(state.devices).map((device) => clone(device));
  }

  function upsertDevice(device) {
    const nextDevice = {
      id: device.id || randomUUID(),
      ...device,
      lastChanged: device.lastChanged ?? Math.floor(Date.now() / 1000)
    };

    state.devices[nextDevice.id] = nextDevice;
    stamp();
    return clone(nextDevice);
  }

  function upsertAlert(alert) {
    const nextAlert = {
      id: alert.id || randomUUID(),
      ...alert,
      createdAt: alert.createdAt || new Date().toISOString(),
      resolved: alert.resolved ?? false
    };

    state.activeAlerts[nextAlert.id] = nextAlert;
    stamp();
    return clone(nextAlert);
  }

  function removeAlert(alertId) {
    const removedAlert = state.activeAlerts[alertId];
    if (!removedAlert) {
      return null;
    }

    delete state.activeAlerts[alertId];
    stamp();
    return clone(removedAlert);
  }

  function listActiveAlerts() {
    return Object.values(state.activeAlerts).map((alert) => clone(alert));
  }

  function replaceDevices(nextDevices) {
    state.devices = {};
    Object.values(nextDevices).forEach((device) => {
      upsertDevice(device);
    });
    stamp();
    return getSnapshot();
  }

  return {
    getDevice,
    getSnapshot,
    listActiveAlerts,
    listDevices,
    removeAlert,
    replaceDevices,
    reset,
    upsertAlert,
    upsertDevice
  };
}