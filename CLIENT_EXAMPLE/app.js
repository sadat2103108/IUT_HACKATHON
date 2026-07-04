/* =========================================================
OFFICEPULSE DASHBOARD
========================================================= */

/* =========================================================
DEVICE DATA
2 fans and 3 lights in each room
Fan power: 60 W
Light power: 15 W
Total devices: 15
========================================================= */

const devices = [
  // Drawing Room
  {
    id: "drawing-fan-1",
    name: "Drawing Room - Fan 1",
    room: "Drawing Room",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 145
  },
  {
    id: "drawing-fan-2",
    name: "Drawing Room - Fan 2",
    room: "Drawing Room",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 35
  },
  {
    id: "drawing-light-1",
    name: "Drawing Room - Light 1",
    room: "Drawing Room",
    type: "Light",
    status: true,
    wattOn: 15,
    minutesAgo: 18
  },
  {
    id: "drawing-light-2",
    name: "Drawing Room - Light 2",
    room: "Drawing Room",
    type: "Light",
    status: true,
    wattOn: 15,
    minutesAgo: 12
  },
  {
    id: "drawing-light-3",
    name: "Drawing Room - Light 3",
    room: "Drawing Room",
    type: "Light",
    status: false,
    wattOn: 15,
    minutesAgo: 7
  },

  // Work Room 1
  {
    id: "work1-fan-1",
    name: "Work Room 1 - Fan 1",
    room: "Work Room 1",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 40
  },
  {
    id: "work1-fan-2",
    name: "Work Room 1 - Fan 2",
    room: "Work Room 1",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 25
  },
  {
    id: "work1-light-1",
    name: "Work Room 1 - Light 1",
    room: "Work Room 1",
    type: "Light",
    status: true,
    wattOn: 15,
    minutesAgo: 16
  },
  {
    id: "work1-light-2",
    name: "Work Room 1 - Light 2",
    room: "Work Room 1",
    type: "Light",
    status: false,
    wattOn: 15,
    minutesAgo: 23
  },
  {
    id: "work1-light-3",
    name: "Work Room 1 - Light 3",
    room: "Work Room 1",
    type: "Light",
    status: false,
    wattOn: 15,
    minutesAgo: 31
  },

  // Work Room 2
  {
    id: "work2-fan-1",
    name: "Work Room 2 - Fan 1",
    room: "Work Room 2",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 50
  },
  {
    id: "work2-fan-2",
    name: "Work Room 2 - Fan 2",
    room: "Work Room 2",
    type: "Fan",
    status: true,
    wattOn: 60,
    minutesAgo: 30
  },
  {
    id: "work2-light-1",
    name: "Work Room 2 - Light 1",
    room: "Work Room 2",
    type: "Light",
    status: true,
    wattOn: 15,
    minutesAgo: 20
  },
  {
    id: "work2-light-2",
    name: "Work Room 2 - Light 2",
    room: "Work Room 2",
    type: "Light",
    status: true,
    wattOn: 15,
    minutesAgo: 11
  },
  {
    id: "work2-light-3",
    name: "Work Room 2 - Light 3",
    room: "Work Room 2",
    type: "Light",
    status: false,
    wattOn: 15,
    minutesAgo: 35
  }
].map((device) => ({
  ...device,
  changedAt: new Date(
    Date.now() - device.minutesAgo * 60 * 1000
  )
}));

/* =========================================================
SETTINGS
========================================================= */

const ROOMS = [
  "Drawing Room",
  "Work Room 1",
  "Work Room 2"
];

const INITIAL_DEVICE_LIMIT = 5;

const FAN_POWER = 60;
const LIGHT_POWER = 15;

const HIGH_ALERT_DURATION_MS =
  2 * 60 * 60 * 1000;

const MEDIUM_ROOM_POWER_THRESHOLD = 120;

const OFFICE_OPEN_HOUR = 9;
const OFFICE_CLOSE_HOUR = 17;

const GAUGE_RADIUS = 92;

const GAUGE_CIRCUMFERENCE =
  2 * Math.PI * GAUGE_RADIUS;

const GAUGE_GAP = 12;

const MIN_STATUS_UPDATE_DELAY = 1200;
const MAX_STATUS_UPDATE_DELAY = 3200;

let showAllDevices = false;
let lastUpdatedDeviceId = null;
let statusUpdateTimer = null;
let alertAnimationPaused = false;
let lastHighAlertSignature = "";

/* =========================================================
HTML ELEMENTS
========================================================= */

const currentTimeElement =
  document.getElementById("currentTime");

const currentDateElement =
  document.getElementById("currentDate");

const officeStatusElement =
  document.getElementById("officeStatus");

const officeHoursStatusElement =
  document.getElementById("officeHoursStatus");

const deviceTable =
  document.getElementById("deviceTable");

const alertTable =
  document.getElementById("alertTable");

const noAlertsMessage =
  document.getElementById("noAlertsMessage");

const totalPowerElement =
  document.getElementById("totalPower");

const drawingPowerElement =
  document.getElementById("drawingPower");

const work1PowerElement =
  document.getElementById("work1Power");

const work2PowerElement =
  document.getElementById("work2Power");

const gaugeWrap =
  document.querySelector(".gauge-wrap");

const drawingGauge =
  document.getElementById("drawingGauge");

const work1Gauge =
  document.getElementById("work1Gauge");

const work2Gauge =
  document.getElementById("work2Gauge");

const deviceCountElement =
  document.getElementById("deviceCount");

const deviceListSummary =
  document.getElementById("deviceListSummary");

const showMoreDevicesButton =
  document.getElementById("showMoreDevices");

const showMoreText =
  document.getElementById("showMoreText");

const hiddenDeviceCount =
  document.getElementById("hiddenDeviceCount");

const showMoreArrow =
  document.getElementById("showMoreArrow");

const alertsCard =
  document.getElementById("alertsCard");

const alertCountElement =
  document.getElementById("alertCount");

const stopAlertAnimationButton =
  document.getElementById("stopAlertAnimation");

const stopAlertText =
  document.getElementById("stopAlertText");

/* =========================================================
CLOCK, DATE, AND OFFICE HOURS
========================================================= */

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatDate(date = new Date()) {
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric"
    })
    .replace(",", " •");
}

function isOfficeOpen(date = new Date()) {
  const hour = date.getHours();

  return (
    hour >= OFFICE_OPEN_HOUR &&
    hour < OFFICE_CLOSE_HOUR
  );
}

function updateOfficeHoursStatus(now = new Date()) {
  const officeIsOpen = isOfficeOpen(now);

  if (officeHoursStatusElement) {
    officeHoursStatusElement.textContent =
      officeIsOpen ? "OPEN" : "CLOSED";

    officeHoursStatusElement.classList.toggle(
      "closed",
      !officeIsOpen
    );
  }

  if (officeStatusElement) {
    officeStatusElement.textContent =
      "OPERATIONAL";

    officeStatusElement.classList.remove(
      "closed"
    );
  }
}

function updateClock() {
  const now = new Date();

  if (currentTimeElement) {
    currentTimeElement.textContent =
      formatTime(now);
  }

  if (currentDateElement) {
    currentDateElement.textContent =
      formatDate(now);
  }

  updateOfficeHoursStatus(now);
}

/* =========================================================
DEVICE HELPERS
========================================================= */

function currentWatt(device) {
  if (!device.status) {
    return 0;
  }

  return device.type === "Fan"
    ? FAN_POWER
    : LIGHT_POWER;
}

function iconFor(type) {
  return type === "Fan" ? "🌀" : "💡";
}

function shortDeviceName(device) {
  const parts = device.name.split(" - ");

  return parts[1] || device.name;
}

function roomDevices(roomName) {
  return devices.filter((device) => {
    return device.room === roomName;
  });
}

function roomTotal(roomName) {
  return roomDevices(roomName).reduce(
    (total, device) => {
      return total + currentWatt(device);
    },
    0
  );
}

function activeDurationMs(
  device,
  now = new Date()
) {
  if (!device.status) {
    return 0;
  }

  return Math.max(
    0,
    now.getTime() -
      device.changedAt.getTime()
  );
}

function isLongRunningDevice(
  device,
  now = new Date()
) {
  return (
    device.status &&
    activeDurationMs(device, now) >=
      HIGH_ALERT_DURATION_MS
  );
}

/* =========================================================
TIME AND DURATION FORMATTERS
========================================================= */

function formatAlertSince(date) {
  const now = new Date();

  const sameDay =
    date.toDateString() ===
    now.toDateString();

  const yesterday = new Date(now);

  yesterday.setDate(
    now.getDate() - 1
  );

  const wasYesterday =
    date.toDateString() ===
    yesterday.toDateString();

  if (sameDay) {
    return formatTime(date);
  }

  if (wasYesterday) {
    return `${formatTime(date)} (Yesterday)`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit"
  })} ${formatTime(date)}`;
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(
    0,
    Math.floor(milliseconds / 60000)
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

/* =========================================================
POWER GAUGE
========================================================= */

function setGaugeSegment(
  segment,
  segmentLength,
  segmentOffset
) {
  if (!segment) {
    return;
  }

  const safeLength = Math.max(
    0,
    segmentLength
  );

  const remainingLength = Math.max(
    0,
    GAUGE_CIRCUMFERENCE -
      safeLength
  );

  segment.style.strokeDasharray =
    `${safeLength} ${remainingLength}`;

  segment.style.strokeDashoffset =
    `${-segmentOffset}`;
}

function renderGauge(
  roomPowerValues,
  totalRoomPower
) {
  const usableGaugeLength =
    GAUGE_CIRCUMFERENCE -
    GAUGE_GAP * 3;

  let segmentLengths = [0, 0, 0];

  if (totalRoomPower > 0) {
    segmentLengths =
      roomPowerValues.map((value) => {
        return (
          value /
          totalRoomPower *
          usableGaugeLength
        );
      });
  }

  let currentOffset = 0;

  setGaugeSegment(
    drawingGauge,
    segmentLengths[0],
    currentOffset
  );

  currentOffset +=
    segmentLengths[0] +
    GAUGE_GAP;

  setGaugeSegment(
    work1Gauge,
    segmentLengths[1],
    currentOffset
  );

  currentOffset +=
    segmentLengths[1] +
    GAUGE_GAP;

  setGaugeSegment(
    work2Gauge,
    segmentLengths[2],
    currentOffset
  );
}

function renderPower(
  animateGauge = true
) {
  const drawingRoomPower =
    roomTotal("Drawing Room");

  const workRoom1Power =
    roomTotal("Work Room 1");

  const workRoom2Power =
    roomTotal("Work Room 2");

  const overallPower =
    drawingRoomPower +
    workRoom1Power +
    workRoom2Power;

  if (drawingPowerElement) {
    drawingPowerElement.textContent =
      `${drawingRoomPower} W`;
  }

  if (work1PowerElement) {
    work1PowerElement.textContent =
      `${workRoom1Power} W`;
  }

  if (work2PowerElement) {
    work2PowerElement.textContent =
      `${workRoom2Power} W`;
  }

  if (totalPowerElement) {
    totalPowerElement.textContent =
      `${overallPower} W`;
  }

  renderGauge(
    [
      drawingRoomPower,
      workRoom1Power,
      workRoom2Power
    ],
    overallPower
  );

  if (
    animateGauge &&
    gaugeWrap
  ) {
    gaugeWrap.classList.remove(
      "gauge-pop"
    );

    void gaugeWrap.offsetWidth;

    gaugeWrap.classList.add(
      "gauge-pop"
    );
  }
}

/* =========================================================
DEVICE TABLE
========================================================= */

function getSortedDevices() {
  return [...devices].sort(
    (firstDevice, secondDevice) => {
      return (
        secondDevice.changedAt -
        firstDevice.changedAt
      );
    }
  );
}

function renderDevices(
  flashDeviceId = null
) {
  if (!deviceTable) {
    return;
  }

  const sortedDevices =
    getSortedDevices();

  const visibleDevices =
    showAllDevices
      ? sortedDevices
      : sortedDevices.slice(
          0,
          INITIAL_DEVICE_LIMIT
        );

  deviceTable.innerHTML =
    visibleDevices
      .map((device) => {
        const flashClass =
          device.id === flashDeviceId
            ? "update-flash"
            : "";

        const statusClass =
          device.status
            ? "on"
            : "off";

        const statusText =
          device.status
            ? "ON"
            : "OFF";

        return `
<tr
  class="${flashClass}"
  data-device-row-id="${device.id}"
>
  <td>${device.name}</td>

  <td>${device.room}</td>

  <td>
    <span class="type-label">
      <span
        class="type-icon"
        aria-hidden="true"
      >
        ${iconFor(device.type)}
      </span>

      ${device.type}
    </span>
  </td>

  <td>
    <span class="status-badge ${statusClass}">
      ${statusText}
    </span>
  </td>

  <td>
    ${currentWatt(device)} W
  </td>

  <td>
    ${formatTime(device.changedAt)}
  </td>
</tr>
`;
      })
      .join("");

  updateShowMoreButton();
}

/* =========================================================
SHOW MORE / SHOW FEWER
========================================================= */

function updateShowMoreButton() {
  if (!showMoreDevicesButton) {
    return;
  }

  const numberOfHiddenDevices =
    Math.max(
      0,
      devices.length -
        INITIAL_DEVICE_LIMIT
    );

  showMoreDevicesButton.setAttribute(
    "aria-expanded",
    String(showAllDevices)
  );

  if (showAllDevices) {
    if (showMoreText) {
      showMoreText.textContent =
        "Show Fewer Devices";
    }

    if (hiddenDeviceCount) {
      hiddenDeviceCount.hidden =
        true;
    }

    if (showMoreArrow) {
      showMoreArrow.textContent =
        "↑";
    }

    if (deviceListSummary) {
      deviceListSummary.textContent =
        `Showing all ${devices.length} devices.`;
    }
  } else {
    if (showMoreText) {
      showMoreText.textContent =
        "Show More Devices";
    }

    if (hiddenDeviceCount) {
      hiddenDeviceCount.hidden =
        false;

      hiddenDeviceCount.textContent =
        numberOfHiddenDevices;
    }

    if (showMoreArrow) {
      showMoreArrow.textContent =
        "↓";
    }

    if (deviceListSummary) {
      deviceListSummary.textContent =
        `Showing the ${INITIAL_DEVICE_LIMIT} most recently updated devices.`;
    }
  }
}

/* =========================================================
DYNAMIC ALERT GENERATION
========================================================= */

function generateAlerts(
  now = new Date()
) {
  const generatedAlerts = [];

  const roomsWithHighAlert =
    new Set();

  devices.forEach((device) => {
    if (
      !isLongRunningDevice(
        device,
        now
      )
    ) {
      return;
    }

    roomsWithHighAlert.add(
      device.room
    );

    generatedAlerts.push({
      id: `high-${device.id}`,
      icon: "🚨",
      message:
        "High power usage has been detected.",
      room: device.room,
      condition:
        `${shortDeviceName(device)} active over 2 hours`,
      since: device.changedAt,
      durationMs:
        activeDurationMs(
          device,
          now
        ),
      severity: "HIGH"
    });
  });

  ROOMS.forEach((roomName) => {
    if (
      roomsWithHighAlert.has(
        roomName
      )
    ) {
      return;
    }

    const activeDevices =
      roomDevices(roomName).filter(
        (device) => {
          return device.status;
        }
      );

    if (
      activeDevices.length === 0
    ) {
      return;
    }

    const power =
      roomTotal(roomName);

    const outsideOfficeHours =
      !isOfficeOpen(now);

    const mediumPowerDetected =
      power >=
      MEDIUM_ROOM_POWER_THRESHOLD;

    if (
      !outsideOfficeHours &&
      !mediumPowerDetected
    ) {
      return;
    }

    const earliestActiveTime =
      activeDevices.reduce(
        (earliest, device) => {
          return (
            device.changedAt <
            earliest
          )
            ? device.changedAt
            : earliest;
        },
        activeDevices[0].changedAt
      );

    generatedAlerts.push({
      id: `medium-${roomName}`,
      icon: "⚠️",
      message:
        "Medium power usage has been detected.",
      room: roomName,
      condition:
        outsideOfficeHours
          ? "Devices active after office hours"
          : `${power} W currently in use`,
      since: earliestActiveTime,
      durationMs:
        now.getTime() -
        earliestActiveTime.getTime(),
      severity: "MEDIUM"
    });
  });

  return generatedAlerts.sort(
    (
      firstAlert,
      secondAlert
    ) => {
      if (
        firstAlert.severity !==
        secondAlert.severity
      ) {
        return (
          firstAlert.severity ===
          "HIGH"
        )
          ? -1
          : 1;
      }

      return (
        secondAlert.durationMs -
        firstAlert.durationMs
      );
    }
  );
}

function updateAlertAnimationState(
  alerts
) {
  const highAlerts =
    alerts.filter((alert) => {
      return (
        alert.severity ===
        "HIGH"
      );
    });

  const highAlertSignature =
    highAlerts
      .map((alert) => {
        return alert.id;
      })
      .sort()
      .join("|");

  const hasHighAlert =
    highAlerts.length > 0;

  if (
    highAlertSignature &&
    highAlertSignature !==
      lastHighAlertSignature
  ) {
    alertAnimationPaused =
      false;
  }

  if (!hasHighAlert) {
    alertAnimationPaused =
      false;
  }

  lastHighAlertSignature =
    highAlertSignature;

  document.body.classList.toggle(
    "has-high-alert",
    hasHighAlert
  );

  document.body.classList.toggle(
    "alert-animation-paused",
    hasHighAlert &&
      alertAnimationPaused
  );

  if (alertsCard) {
    alertsCard.classList.toggle(
      "high-alert-active",
      hasHighAlert
    );

    alertsCard.classList.toggle(
      "alert-animation-paused",
      hasHighAlert &&
        alertAnimationPaused
    );
  }

  updateStopAlertButton(
    hasHighAlert
  );
}

function renderAlerts() {
  if (!alertTable) {
    return;
  }

  const alerts =
    generateAlerts();

  alertTable.innerHTML =
    alerts
      .map((alert) => {
        const severityClass =
          alert.severity.toLowerCase();

        return `
<tr>
  <td>
    <span
      class="alert-icon"
      aria-hidden="true"
    >
      ${alert.icon}
    </span>

    ${alert.message}
  </td>

  <td>
    ${alert.room}
  </td>

  <td>
    ${alert.condition}
  </td>

  <td>
    ${formatAlertSince(alert.since)}
  </td>

  <td>
    ${formatDuration(alert.durationMs)}
  </td>

  <td>
    <span class="severity ${severityClass}">
      ${alert.severity}
    </span>
  </td>
</tr>
`;
      })
      .join("");

  if (alertCountElement) {
    alertCountElement.textContent =
      alerts.length;
  }

  if (noAlertsMessage) {
    noAlertsMessage.hidden =
      alerts.length > 0;
  }

  const alertTableElement =
    alertTable.closest("table");

  if (alertTableElement) {
    alertTableElement.hidden =
      alerts.length === 0;
  }

  updateAlertAnimationState(
    alerts
  );
}

/* =========================================================
STOP HIGH-ALERT ANIMATION
========================================================= */

function updateStopAlertButton(
  hasHighAlert
) {
  if (
    !stopAlertAnimationButton
  ) {
    return;
  }

  stopAlertAnimationButton.hidden =
    !hasHighAlert;

  stopAlertAnimationButton.setAttribute(
    "aria-pressed",
    String(alertAnimationPaused)
  );

  if (stopAlertText) {
    stopAlertText.textContent =
      alertAnimationPaused
        ? "Alert Acknowledged"
        : "Acknowledge Alert";
  }

  const icon =
    stopAlertAnimationButton.querySelector(
      ".stop-alert-icon"
    );

  if (icon) {
    icon.textContent =
      alertAnimationPaused
        ? "✓"
        : "■";
  }
}

function stopHighAlertAnimation() {
  const alerts =
    generateAlerts();

  const hasHighAlert =
    alerts.some((alert) => {
      return (
        alert.severity ===
        "HIGH"
      );
    });

  if (!hasHighAlert) {
    return;
  }

  alertAnimationPaused = true;

  document.body.classList.add(
    "alert-animation-paused"
  );

  if (alertsCard) {
    alertsCard.classList.add(
      "alert-animation-paused"
    );
  }

  updateStopAlertButton(true);
}

/* =========================================================
FLOOR PLAN DEVICE STATUS
========================================================= */

function syncFloor() {
  devices.forEach((device) => {
    const deviceElement =
      document.querySelector(
        `.device[data-id="${device.id}"]`
      );

    if (!deviceElement) {
      return;
    }

    deviceElement.classList.toggle(
      "on",
      device.status
    );

    deviceElement.classList.toggle(
      "off",
      !device.status
    );

    deviceElement.setAttribute(
      "aria-pressed",
      String(device.status)
    );

    deviceElement.title =
      `${device.name}: ` +
      `${device.status ? "ON" : "OFF"} | ` +
      `${currentWatt(device)} W`;
  });
}

/* =========================================================
DEVICE TOGGLE
========================================================= */

function toggleDevice(deviceId) {
  const selectedDevice =
    devices.find((device) => {
      return (
        device.id ===
        deviceId
      );
    });

  if (!selectedDevice) {
    return;
  }

  selectedDevice.status =
    !selectedDevice.status;

  selectedDevice.changedAt =
    new Date();

  lastUpdatedDeviceId =
    selectedDevice.id;

  syncFloor();

  renderDevices(
    selectedDevice.id
  );

  renderPower(true);

  renderAlerts();
}

/* =========================================================
AUTOMATIC LIVE STATUS SIMULATION
========================================================= */

function randomLiveStatusUpdate() {
  const now = new Date();

  const availableDevices =
    devices.filter((device) => {
      return (
        device.id !==
          lastUpdatedDeviceId &&
        !isLongRunningDevice(
          device,
          now
        )
      );
    });

  if (
    availableDevices.length === 0
  ) {
    return;
  }

  const randomDeviceIndex =
    Math.floor(
      Math.random() *
        availableDevices.length
    );

  toggleDevice(
    availableDevices[
      randomDeviceIndex
    ].id
  );
}

function scheduleNextStatusUpdate() {
  const delayRange =
    MAX_STATUS_UPDATE_DELAY -
    MIN_STATUS_UPDATE_DELAY;

  const nextDelay =
    Math.floor(
      Math.random() *
        delayRange
    ) +
    MIN_STATUS_UPDATE_DELAY;

  statusUpdateTimer =
    setTimeout(() => {
      randomLiveStatusUpdate();

      scheduleNextStatusUpdate();
    }, nextDelay);
}

function startLiveDashboard() {
  scheduleNextStatusUpdate();

  setInterval(() => {
    renderAlerts();
  }, 1000);
}

/* =========================================================
EVENT LISTENERS
========================================================= */

document
  .querySelectorAll(".device")
  .forEach((deviceElement) => {
    deviceElement.addEventListener(
      "click",
      () => {
        toggleDevice(
          deviceElement.dataset.id
        );
      }
    );
  });

if (showMoreDevicesButton) {
  showMoreDevicesButton.addEventListener(
    "click",
    () => {
      showAllDevices =
        !showAllDevices;

      renderDevices();
    }
  );
}

if (stopAlertAnimationButton) {
  stopAlertAnimationButton.addEventListener(
    "click",
    stopHighAlertAnimation
  );
}

/* =========================================================
INITIALIZE DASHBOARD
========================================================= */

if (deviceCountElement) {
  deviceCountElement.textContent =
    devices.length;
}

updateClock();

renderDevices();

renderAlerts();

syncFloor();

renderPower(false);

setInterval(
  updateClock,
  1000
);

startLiveDashboard();