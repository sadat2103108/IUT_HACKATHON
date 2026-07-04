import process from 'node:process';

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS || 15000);

const DEVICE_IDS = [
  'drawing-fan-1',
  'drawing-fan-2',
  'drawing-light-1',
  'drawing-light-2',
  'drawing-light-3',
  'work1-fan-1',
  'work1-fan-2',
  'work1-light-1',
  'work1-light-2',
  'work1-light-3',
  'work2-fan-1',
  'work2-fan-2',
  'work2-light-1',
  'work2-light-2',
  'work2-light-3'
];

const deviceState = Object.fromEntries(DEVICE_IDS.map((deviceId) => [deviceId, {
  id: deviceId,
  room: deviceId.startsWith('drawing') ? 'Drawing Room' : deviceId.startsWith('work1') ? 'Work Room 1' : 'Work Room 2',
  type: deviceId.includes('fan') ? 'Fan' : 'Light',
  status: false,
  powerRating: deviceId.includes('fan') ? 60 : 15,
  lastChanged: Math.floor(Date.now() / 1000)
}]));

export function parseCommand(commandLine) {
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return { action: 'invalid' };
  }

  const parts = trimmed.toLowerCase().split(/\s+/);
  const [action, deviceId, value] = parts;

  if (action === 'list') {
    return { action: 'list' };
  }

  if (action === 'help') {
    return { action: 'help' };
  }

  if (action === 'set' && deviceId && (value === 'on' || value === 'off')) {
    return { action: 'set', deviceId, value };
  }

  return { action: 'invalid' };
}

function listDevices() {
  console.log('Available devices:');
  DEVICE_IDS.forEach((deviceId) => {
    const device = deviceState[deviceId];
    console.log(`- ${deviceId}: ${device.status ? 'ON' : 'OFF'}`);
  });
}

function buildPayload(deviceId, status) {
  const device = deviceState[deviceId];
  if (!device) {
    throw new Error(`Unknown device: ${deviceId}`);
  }

  device.status = status;
  device.lastChanged = Math.floor(Date.now() / 1000);

  return {
    deviceId,
    status,
    timestamp: device.lastChanged,
    room: device.room,
    type: device.type,
    powerRating: device.powerRating
  };
}

async function sendUpdate(payload) {
  const response = await fetch(`${SERVER_URL}/api/device/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Simulator update failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Simulated device update sent:', payload.deviceId, '->', payload.status, data.device?.lastChanged);
}

async function sendFullSync() {
  const response = await fetch(`${SERVER_URL}/api/device/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ devices: deviceState })
  });

  if (!response.ok) {
    throw new Error(`Simulator sync failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Simulated full sync sent:', Object.keys(data.devices || {}).length);
}

async function runInteractiveLoop() {
  console.log(`Interactive office simulator started. Posting to ${SERVER_URL}`);
  console.log('Commands:');
  console.log('  set <device-id> on|off');
  console.log('  list');
  console.log('  help');
  console.log('  quit');

  let lastSync = Date.now();

  const rl = (await import('node:readline/promises')).createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const input = await rl.question('sim> ');
    const command = input.trim();

    if (!command || command === 'quit') {
      break;
    }

    const parsed = parseCommand(command);

    if (parsed.action === 'list') {
      listDevices();
      continue;
    }

    if (parsed.action === 'help') {
      console.log('Commands: set <device-id> on|off, list, help, quit');
      continue;
    }

    if (parsed.action === 'set') {
      try {
        const payload = buildPayload(parsed.deviceId, parsed.value === 'on');
        await sendUpdate(payload);

        if (Date.now() - lastSync >= SYNC_INTERVAL_MS) {
          await sendFullSync();
          lastSync = Date.now();
        }
      } catch (error) {
        console.error('Simulator error:', error.message);
      }
      continue;
    }

    console.log('Invalid command. Use: set <device-id> on|off, list, help, quit');
  }

  rl.close();
  console.log('Simulator stopped.');
}

runInteractiveLoop().catch((error) => {
  console.error('Simulator crashed:', error);
  process.exit(1);
});
