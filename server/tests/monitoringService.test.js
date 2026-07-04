import test from 'node:test';
import assert from 'node:assert/strict';
import { createMonitoringService } from '../services/monitoringService.js';

test('device updates produce a power summary and active alerts', () => {
  const service = createMonitoringService();
  const result = service.handleDeviceUpdate({
    deviceId: 'drawing_fan1',
    room: 'drawing',
    type: 'fan',
    status: true,
    powerRating: 60,
    timestamp: 1
  });

  const power = service.getPowerSummary();

  assert.equal(result.device.status, true);
  assert.equal(power.total, 60);
  assert.equal(power.byRoom.drawing, 60);
});
