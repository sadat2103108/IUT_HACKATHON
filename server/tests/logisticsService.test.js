import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogisticsService } from '../services/logisticsService.js';

test('createShipment and updateShipmentStatus update state and reports', () => {
  const service = createLogisticsService();

  const shipment = service.createShipment({
    trackingNumber: 'TRK-001',
    origin: 'Dhaka',
    destination: 'Chittagong',
    vehicleId: 'V-001',
    driverId: 'D-001'
  });

  const updated = service.updateShipmentStatus(shipment.id, 'in_transit', {
    location: 'Comilla'
  });

  const summary = service.getReportSummary();

  assert.equal(updated.status, 'in_transit');
  assert.equal(updated.currentLocation, 'Comilla');
  assert.equal(summary.activeShipments, 1);
  assert.equal(summary.pendingIncidents, 0);
});
