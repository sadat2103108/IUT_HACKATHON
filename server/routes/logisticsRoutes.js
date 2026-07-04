import express from 'express';
import { createLogisticsController } from '../controllers/logisticsController.js';

export function registerLogisticsRoutes(app, service) {
  const controller = createLogisticsController(service);
  const router = express.Router();

  router.get('/health', controller.getHealth);
  router.get('/state', controller.getState);
  router.get('/shipments', controller.listShipments);
  router.post('/shipments', controller.createShipment);
  router.patch('/shipments/:id/status', controller.updateShipmentStatus);
  router.get('/inventory', controller.listInventory);
  router.get('/vehicles', controller.listVehicles);
  router.get('/drivers', controller.listDrivers);
  router.get('/warehouses', controller.listWarehouses);
  router.get('/incidents', controller.listIncidents);
  router.post('/incidents', controller.createIncident);
  router.get('/payments', controller.listPayments);
  router.get('/summary', controller.getSummary);
  router.post('/simulate/random-update', controller.simulateUpdate);

  app.use('/api', router);
}
