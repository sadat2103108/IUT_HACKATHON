import express from 'express';
import { createMonitoringController } from '../controllers/monitoringController.js';

export function registerMonitoringRoutes(app, service) {
  const controller = createMonitoringController(service);
  const router = express.Router();

  router.get('/health', controller.getHealth);
  router.get('/state', controller.getState);
  router.get('/power', controller.getPower);
  router.get('/alerts', controller.getAlerts);
  router.post('/device/update', controller.updateDevice);
  router.post('/device/sync', controller.syncDevices);
  router.post('/alerts/:id/resolve', controller.resolveAlert);
  router.post('/bot/alert', (req, res) => {
    const { type, message } = req.body;
    res.json({ ok: true, type, message });
  });

  app.use('/api', router);
}
