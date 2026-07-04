import { Server } from 'socket.io';

export function initializeMonitoringSocket(httpServer, service) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.emit('device:update', service.getSnapshot());
    socket.emit('power:update', service.getPowerSummary());
    socket.emit('alert:new', service.getSnapshot().activeAlerts);
  });

  service.on('state:changed', (snapshot) => {
    io.emit('device:update', snapshot);
    io.emit('power:update', getPowerSummaryFromSnapshot(snapshot));
    io.emit('alert:new', snapshot.activeAlerts);
  });

  return io;
}

function getPowerSummaryFromSnapshot(snapshot) {
  const byRoom = {};
  let total = 0;

  Object.values(snapshot.devices).forEach((device) => {
    const power = device.status ? device.powerRating : 0;
    total += power;
    byRoom[device.room] = (byRoom[device.room] || 0) + power;
  });

  return { total, byRoom };
}
