import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand } from '../simulations/deviceSimulator.js';

test('parseCommand parses set and list commands', () => {
  assert.deepEqual(parseCommand('set drawing-fan-1 on'), {
    action: 'set',
    deviceId: 'drawing-fan-1',
    value: 'on'
  });

  assert.deepEqual(parseCommand('list'), { action: 'list' });
  assert.deepEqual(parseCommand('help'), { action: 'help' });
});

test('parseCommand rejects unknown commands', () => {
  assert.equal(parseCommand('bogus').action, 'invalid');
});
