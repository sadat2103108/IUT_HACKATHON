import { EventEmitter } from 'node:events';
import { createLogisticsStore } from '../store/logisticsStore.js';

const defaultSeedData = {
  shipments: [],
  inventoryItems: [
    { id: 'INV-001', sku: 'SKU-001', name: 'Parcel Box', stock: 120, reorderLevel: 40 },
    { id: 'INV-002', sku: 'SKU-002', name: 'Cold Pack', stock: 80, reorderLevel: 25 }
  ],
  vehicles: [
    { id: 'V-001', name: 'Truck-01', status: 'active', mileage: 8200, maintenanceDue: '2026-07-20' },
    { id: 'V-002', name: 'Van-02', status: 'maintenance', mileage: 5100, maintenanceDue: '2026-07-08' }
  ],
  drivers: [
    { id: 'D-001', name: 'Nadia Rahman', status: 'available', shift: 'day' },
    { id: 'D-002', name: 'Rafiq Hasan', status: 'rest', shift: 'night' }
  ],
  warehouses: [
    { id: 'W-001', name: 'Hub Dhaka', status: 'active', capacity: 90 },
    { id: 'W-002', name: 'Hub Chittagong', status: 'active', capacity: 75 }
  ],
  incidents: [],
  payments: [],
  alerts: []
};

export function createLogisticsService({ notifier } = {}) {
  const store = createLogisticsStore();
  const emitter = new EventEmitter();

  store.seed(defaultSeedData);

  async function dispatchAlert(alert) {
    if (typeof notifier === 'function') {
      try {
        await notifier(alert);
      } catch (error) {
        console.error('Alert dispatch failed:', error);
      }
    }
  }

  function emitChange() {
    emitter.emit('state:changed', store.getSnapshot());
  }

  function createShipment(payload) {
    const shipment = store.addItem('shipments', {
      trackingNumber: payload.trackingNumber,
      origin: payload.origin,
      destination: payload.destination,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId,
      status: payload.status || 'pending',
      currentLocation: payload.origin,
      createdAt: new Date().toISOString()
    });

    emitChange();
    return shipment;
  }

  function updateShipmentStatus(id, status, meta = {}) {
    const shipment = store.updateItem('shipments', id, {
      status,
      currentLocation: meta.location || meta.currentLocation || undefined,
      updatedAt: new Date().toISOString()
    });

    if (!shipment) {
      return null;
    }

    if (status === 'delayed' || status === 'failed' || status === 'delivered') {
      dispatchAlert({
        type: 'shipment_status',
        title: `Shipment ${shipment.trackingNumber} ${status}`,
        message: meta.message || `Shipment ${shipment.trackingNumber} moved to ${status}.`
      });
    }

    emitChange();
    return shipment;
  }

  function addIncident(payload) {
    const incident = store.addItem('incidents', {
      title: payload.title,
      severity: payload.severity || 'medium',
      description: payload.description || 'No details provided.',
      shipmentId: payload.shipmentId || null,
      createdAt: new Date().toISOString(),
      resolved: false
    });

    dispatchAlert({
      type: 'incident',
      title: incident.title,
      message: `${incident.severity.toUpperCase()} incident reported: ${incident.description}`
    });

    emitChange();
    return incident;
  }

  function updateInventory(sku, updates) {
    const inventoryItem = store.getCollection('inventoryItems').find((item) => item.sku === sku);
    if (!inventoryItem) {
      return null;
    }

    const updated = store.updateItem('inventoryItems', inventoryItem.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    emitChange();
    return updated;
  }

  function updateVehicle(id, updates) {
    const vehicle = store.updateItem('vehicles', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (vehicle) {
      emitChange();
    }

    return vehicle;
  }

  function updateDriver(id, updates) {
    const driver = store.updateItem('drivers', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (driver) {
      emitChange();
    }

    return driver;
  }

  function updateWarehouse(id, updates) {
    const warehouse = store.updateItem('warehouses', id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (warehouse) {
      emitChange();
    }

    return warehouse;
  }

  function recordPayment(payload) {
    const payment = store.addItem('payments', {
      shipmentId: payload.shipmentId,
      amount: payload.amount,
      method: payload.method || 'cash',
      status: payload.status || 'pending',
      createdAt: new Date().toISOString()
    });

    emitChange();
    return payment;
  }

  function getSnapshot() {
    return store.getSnapshot();
  }

  function getReportSummary() {
    const snapshot = store.getSnapshot();
    return {
      activeShipments: snapshot.shipments.filter((shipment) => shipment.status !== 'delivered' && shipment.status !== 'cancelled').length,
      pendingIncidents: snapshot.incidents.filter((incident) => !incident.resolved).length,
      inventoryAlertCount: snapshot.inventoryItems.filter((item) => item.stock <= item.reorderLevel).length,
      vehicleActiveCount: snapshot.vehicles.filter((vehicle) => vehicle.status === 'active').length,
      updatedAt: snapshot.updatedAt
    };
  }

  async function handleSimulatedUpdate(payload) {
    switch (payload.type) {
      case 'shipment_status':
        updateShipmentStatus(payload.shipmentId, payload.status, payload.meta || {});
        break;
      case 'inventory':
        updateInventory(payload.sku, { stock: payload.stock, status: payload.status || 'active' });
        break;
      case 'incident':
        addIncident(payload);
        break;
      case 'vehicle_status':
        updateVehicle(payload.vehicleId, { status: payload.status, notes: payload.notes || '' });
        break;
      case 'driver_status':
        updateDriver(payload.driverId, { status: payload.status, notes: payload.notes || '' });
        break;
      case 'warehouse_activity':
        updateWarehouse(payload.warehouseId, { status: payload.status, capacity: payload.capacity });
        break;
      case 'payment':
        recordPayment(payload);
        break;
      default:
        createShipment(payload);
    }

    return store.getSnapshot();
  }

  return {
    addIncident,
    createShipment,
    getReportSummary,
    getSnapshot,
    handleSimulatedUpdate,
    on: emitter.on.bind(emitter),
    recordPayment,
    updateDriver,
    updateInventory,
    updateShipmentStatus,
    updateVehicle,
    updateWarehouse
  };
}
