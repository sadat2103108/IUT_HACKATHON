# OfficePulse Dashboard

OfficePulse is a smart-office monitoring dashboard built with HTML, CSS, and JavaScript. It simulates the live status of office lights and fans, calculates room-wise and total power consumption, displays dynamic alerts, and presents the office in an animated top-view layout created entirely with CSS.

## Project Files

Keep these files in the same folder:

- `index.html`
- `style.css`
- `app.js`
- `README.md`

## How to Run

Open `index.html` in a modern web browser.

For development, you can also open the project folder in Visual Studio Code and run the page using the Live Server extension.

## Office Setup

The office contains three rooms:

- Drawing Room
- Work Room 1
- Work Room 2

Each room contains:

- 2 fans
- 3 lights

Total devices:

- 6 fans
- 9 lights
- 15 devices

## Device Power Values

The dashboard follows the required device wattages:

- Fan: `60 W`
- Light: `15 W`

These values are defined in `app.js`:

```javascript
const FAN_POWER = 60;
const LIGHT_POWER = 15;
```

When a device is OFF, its power usage is `0 W`.

## Main Features

The dashboard includes:

- Live clock and date
- Dynamic office-hours status
- Animated top-view office layout
- Three rooms with furniture, windows, doors, plants, and corridor
- Three lights and two fans in each room
- Clickable lights and fans
- Glowing light animation when a light is ON
- Rotating and swinging fan animation when a fan is ON
- Live device status table
- Room-wise power calculation
- Total power gauge
- Dynamic HIGH and MEDIUM alerts
- Stop Alert Animation button
- Responsive layout

## CSS-Built Office Layout

The office layout is not an image.

It is created with HTML elements and CSS so the device states can be animated directly. The layout contains:

- Drawing Room with sofa, chair, rug, and table
- Work Room 1 with four desks
- Work Room 2 with four desks
- Windows and room doors
- Corridor with plants and water cooler
- Main entry door and entry indicator

The layout follows the supplied top-view reference, with:

- Two lights at the top of each room
- One light at the bottom center
- One fan near the upper center
- One fan near the lower center

## Device Interaction

Click any fan or light in the office map to change its status.

When a device is clicked:

- Its state changes between ON and OFF
- Its animation starts or stops
- Its power value updates
- Its last-changed time updates
- The device moves according to the latest update order in the status table
- The corresponding row briefly flashes
- Room power is recalculated
- Total office power is recalculated
- Alerts are generated again

The device-toggle function is:

```javascript
toggleDevice(deviceId);
```

## Live Device Status Table

The device table displays:

- Device name
- Room
- Type
- Status
- Current power
- Last changed time

By default, the table shows the five most recently changed devices.

Use the **Show More Devices** button to display all 15 devices. Use **Show Fewer Devices** to return to the compact view.

## Power Calculation

The current power of a device is calculated with:

```javascript
function currentWatt(device) {
  if (!device.status) {
    return 0;
  }

  return device.type === "Fan"
    ? FAN_POWER
    : LIGHT_POWER;
}
```

Room power is calculated by adding the power of all active devices in that room.

The dashboard shows:

- Drawing Room power
- Work Room 1 power
- Work Room 2 power
- Total office power

The circular gauge changes according to each room's share of the total power.

## Office Hours

Office hours are:

```text
9:00 AM - 5:00 PM
```

The Office Hours indicator automatically changes between:

- `OPEN`
- `CLOSED`

The office-hours settings are defined in `app.js`:

```javascript
const OFFICE_OPEN_HOUR = 9;
const OFFICE_CLOSE_HOUR = 17;
```

## Alert Logic

The dashboard generates alerts automatically from the current device data.

Only two alert levels are used:

- HIGH
- MEDIUM

There is no LOW alert.

### HIGH Alert

A HIGH alert is generated when any active device has remained ON continuously for at least two hours.

The duration limit is defined as:

```javascript
const HIGH_ALERT_DURATION_MS =
  2 * 60 * 60 * 1000;
```

The HIGH alert message is intentionally short:

```text
High power usage has been detected.
```

The table separately shows:

- Room
- Device or condition
- Starting time
- Duration
- Severity

### MEDIUM Alert

A MEDIUM alert is generated when a room has active devices and either:

- Devices are active outside office hours, or
- The room power reaches the configured medium threshold

The current threshold is:

```javascript
const MEDIUM_ROOM_POWER_THRESHOLD = 120;
```

The MEDIUM alert message is:

```text
Medium power usage has been detected.
```

A room that already has a HIGH alert does not receive a duplicate MEDIUM alert at the same time.

## Active Alert Table

The Active Alerts section displays:

- Alert message
- Room
- Device or condition
- Since
- Duration
- Severity

Alert durations update every second.

If there are no alerts, the dashboard displays:

```text
No active alerts at this time.
```

## HIGH Alert Animation

When at least one HIGH alert exists, the dashboard displays:

- Pulsing red border around the browser window
- Red corner glow
- Pulsing border around the alert panel
- Pulsing warning icon
- Moving red scan effect across the alert panel

The alert animation is automatically reactivated when a new HIGH-alert condition appears.

## Stop Alert Animation Button

When a HIGH alert is active, the **Stop Alert Animation** button becomes visible.

Clicking the button:

- Stops the page-border animation
- Stops the red corner glow
- Stops the alert-panel pulse
- Stops the scan animation
- Stops the warning-icon pulse
- Keeps the alert visible in the table
- Changes the button text to `Alert Animation Stopped`

The button only acknowledges the visual animation. It does not remove the alert or change its severity.

The function is:

```javascript
stopHighAlertAnimation();
```

## Automatic Device Simulation

The dashboard simulates live device changes using random delays.

```javascript
const MIN_STATUS_UPDATE_DELAY = 1200;
const MAX_STATUS_UPDATE_DELAY = 3200;
```

This means a simulated device update occurs after a changing delay between 1.2 and 3.2 seconds.

Devices that are already generating a two-hour HIGH alert are excluded from automatic random toggling so the alert remains visible for demonstration and testing.

## Initial Demo Data

The initial device data includes one long-running device so the HIGH-alert feature can be demonstrated immediately.

Example:

```javascript
{
  id: "drawing-fan-1",
  name: "Drawing Room - Fan 1",
  room: "Drawing Room",
  type: "Fan",
  status: true,
  wattOn: 60,
  minutesAgo: 145
}
```

Because this fan has been ON for more than two hours, the dashboard creates a HIGH alert when the page loads.

## Fan Animation

When a fan is ON:

- The blades rotate continuously
- The fan head moves gently from side to side

When the fan is OFF:

- Blade rotation stops
- Swinging stops
- The fan appears faded

## Light Animation

When a light is ON:

- The bulb glows
- A soft halo appears
- The halo uses a breathing animation

When the light is OFF:

- The glow disappears
- The device appears faded

## Responsive Design

The dashboard adapts for:

- Desktop screens
- Laptops
- Tablets
- Mobile devices

On smaller screens, the floor plan remains scrollable so its layout is not compressed beyond readability.

## Browser Support

The dashboard works best in modern browsers such as:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

## Current Project Scope

This version is a frontend simulation built with:

- HTML
- CSS
- JavaScript

It does not yet use a shared backend, database, WebSocket server, MQTT broker, or Discord bot.

For the complete hackathon architecture, the dashboard and Discord bot should later connect to one shared backend so both read the same device state.

Recommended future data flow:

```text
Simulated Device Layer
        ↓
Shared Backend API
        ↓
Web Dashboard + Discord Bot
```

## Connecting a Real Backend Later

The current device data can later be replaced with live data from:

- REST API
- WebSocket
- MQTT
- Firebase Realtime Database
- ESP32
- Arduino
- Smart relay controller

After receiving updated device data, call:

```javascript
syncFloor();
renderDevices();
renderPower();
renderAlerts();
```

## Important Functions

```javascript
updateClock();
renderDevices();
renderPower();
renderAlerts();
syncFloor();
toggleDevice(deviceId);
stopHighAlertAnimation();
startLiveDashboard();
```

## Suggested Folder Structure

```text
OfficePulse/
│
├── index.html
├── style.css
├── app.js
└── README.md
```

## Summary

OfficePulse currently provides an animated and interactive smart-office dashboard with 15 devices, correct power values, automatic power calculations, real-time device simulation, two-hour HIGH alerts, MEDIUM alerts, and user-controlled alert animation.