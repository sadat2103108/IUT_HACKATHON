export function createLogisticsController(service) {
  function getHealth(req, res) {
    res.json({
      status: 'ok',
      service: 'northshore-logistics-server',
      timestamp: new Date().toISOString()
    });
  }

  function getState(req, res) {
    res.json(service.getSnapshot());
  }

  function listShipments(req, res) {
    res.json(service.getSnapshot().shipments);
  }

  function createShipment(req, res) {
    try {
      const shipment = service.createShipment(req.body);
      res.status(201).json(shipment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  function updateShipmentStatus(req, res) {
    const shipment = service.updateShipmentStatus(req.params.id, req.body.status, req.body);
    if (!shipment) {
      res.status(404).json({ error: 'Shipment not found' });
      return;
    }

    res.json(shipment);
  }

  function listInventory(req, res) {
    res.json(service.getSnapshot().inventoryItems);
  }

  function listVehicles(req, res) {
    res.json(service.getSnapshot().vehicles);
  }

  function listDrivers(req, res) {
    res.json(service.getSnapshot().drivers);
  }

  function listWarehouses(req, res) {
    res.json(service.getSnapshot().warehouses);
  }

  function createIncident(req, res) {
    const incident = service.addIncident(req.body);
    res.status(201).json(incident);
  }

  function listIncidents(req, res) {
    res.json(service.getSnapshot().incidents);
  }

  function listPayments(req, res) {
    res.json(service.getSnapshot().payments);
  }

  function getSummary(req, res) {
    res.json(service.getReportSummary());
  }

  async function simulateUpdate(req, res) {
    const snapshot = await service.handleSimulatedUpdate(req.body);
    res.json(snapshot);
  }

  return {
    createIncident,
    createShipment,
    getHealth,
    getState,
    getSummary,
    listDrivers,
    listIncidents,
    listInventory,
    listPayments,
    listShipments,
    listVehicles,
    listWarehouses,
    simulateUpdate,
    updateShipmentStatus
  };
}
