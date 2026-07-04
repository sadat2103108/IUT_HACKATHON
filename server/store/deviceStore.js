const state = {
  rooms: [],
  devices: [],
  alerts: [],
  updatedAt: null
};

export function getState() {
  return state;
}

export function setState(nextState) {
  state.rooms = nextState.rooms || [];
  state.devices = nextState.devices || [];
  state.alerts = nextState.alerts || [];
  state.updatedAt = new Date().toISOString();

  return state;
}