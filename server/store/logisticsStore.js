import { randomUUID } from 'node:crypto';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createLogisticsStore() {
  const state = {
    shipments: [],
    inventoryItems: [],
    vehicles: [],
    drivers: [],
    warehouses: [],
    incidents: [],
    payments: [],
    alerts: [],
    updatedAt: null
  };

  function getSnapshot() {
    return {
      ...clone(state),
      updatedAt: state.updatedAt
    };
  }

  function setUpdatedAt() {
    state.updatedAt = new Date().toISOString();
  }

  function addItem(collectionName, item) {
    const nextItem = { id: item.id || randomUUID(), ...item };
    state[collectionName].push(nextItem);
    setUpdatedAt();
    return nextItem;
  }

  function updateItem(collectionName, id, updates) {
    const item = state[collectionName].find((entry) => entry.id === id);
    if (!item) {
      return null;
    }

    Object.assign(item, updates);
    setUpdatedAt();
    return item;
  }

  function getCollection(collectionName) {
    return clone(state[collectionName]);
  }

  function appendAlert(alert) {
    const nextAlert = {
      id: alert.id || randomUUID(),
      createdAt: new Date().toISOString(),
      ...alert
    };

    state.alerts.unshift(nextAlert);
    setUpdatedAt();
    return nextAlert;
  }

  function seed(initialSeed) {
    Object.entries(initialSeed).forEach(([collectionName, items]) => {
      state[collectionName] = clone(items);
    });
    setUpdatedAt();
  }

  return {
    addItem,
    appendAlert,
    getCollection,
    getSnapshot,
    seed,
    updateItem
  };
}
