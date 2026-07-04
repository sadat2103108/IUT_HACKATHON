export function createMonitoringController(service) {
  function getHealth(req, res) {
    res.json({
      status: 'ok',
      service: 'office-monitoring-server',
      timestamp: new Date().toISOString()
    });
  }

  function getState(req, res) {
    res.json(service.getSnapshot());
  }

  function getPower(req, res) {
    res.json(service.getPowerSummary());
  }

  function updateDevice(req, res) {
    const result = service.handleDeviceUpdate(req.body);
    res.json(result);
  }

  function syncDevices(req, res) {
    const snapshot = service.syncDevices(req.body.devices || req.body);
    res.json(snapshot);
  }

  function resolveAlert(req, res) {
    const alert = service.resolveAlert(req.params.id);
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  }

  function getAlerts(req, res) {
    res.json(service.getSnapshot().activeAlerts);
  }

  return {
    getAlerts,
    getHealth,
    getPower,
    getState,
    resolveAlert,
    syncDevices,
    updateDevice
  };
}
