# Project Description: Lights, Fans, Discord — Real-Time Office IoT Monitoring System

## Project Overview

This project is a hackathon-grade, real-time office monitoring system that simulates an IoT deployment for monitoring electrical devices (lights and fans) in an office environment. The system provides live monitoring through both a web dashboard and a Discord bot, sharing a single backend and a single source of truth.

The project intentionally does NOT use physical hardware. Instead, a simulator service mimics the behavior of future ESP32/STM32 microcontrollers. The architecture must be designed such that the simulator can later be replaced by real microcontrollers without changing the backend, dashboard, or Discord bot.

The system prioritizes:

* Real-time updates
* Event-driven architecture
* Separation of concerns
* Single source of truth
* Extensibility to real hardware
* No persistent storage requirements

---

# Office Layout

The office consists of 3 rooms:

1. Drawing Room
2. Work Room 1
3. Work Room 2

Each room contains:

* 2 Fans
* 3 Lights

Total devices:

* 6 devices per room
* 18 devices total

Each device has:

* deviceId
* deviceType (fan/light)
* room
* status (ON/OFF)
* powerRating
* lastChanged timestamp

Example:

```json
{
    "deviceId": "work1_fan1",
    "type": "fan",
    "room": "work1",
    "status": true,
    "powerRating": 60,
    "lastChanged": 1751600000
}
```

---

# High-Level Architecture

The system follows an event-driven architecture.

```text
Simulator (Future ESP32)
            |
            | HTTP POST
            v
Backend API + Event Engine
            |
      --------------------
      |                  |
      |                  |
 Socket.IO          Discord Bot
      |                  |
      v                  v
 Dashboard         Discord Server
```

The backend acts as:

* state manager
* event processor
* alert engine
* power calculator
* websocket broadcaster

The backend is NOT a database.

---

# Design Philosophy

This system is NOT:

* a historical analytics system
* a logging platform
* a database application

This system IS:

* a live monitoring platform
* an event processing system
* a real-time dashboard

Therefore:

* no database is required
* no historical persistence is required
* all state exists in RAM
* simulator devices periodically synchronize state

---

# Components

The project consists of four services:

## 1. Backend Service

Technology:

* Node.js
* Express.js
* Socket.IO

Responsibilities:

* maintain live device state
* maintain active alerts
* calculate total power
* calculate room power
* detect alert conditions
* broadcast websocket events
* provide REST APIs
* serve dashboard assets

Backend memory stores:

```javascript
{
    devices: {},
    activeAlerts: {}
}
```

The backend is the single source of truth for:

* current device state
* currently active alerts

The backend is NOT responsible for storing historical data.

---

## 2. Simulator Service

Technology:

* Node.js

Purpose:

Simulate future ESP32 devices.

Responsibilities:

* generate realistic device changes
* send updates to backend
* periodically synchronize all device states
* simulate device failures
* simulate office usage patterns

Communication:

```text
Simulator ---> HTTP POST ---> Backend
```

The simulator behaves exactly as a future ESP32 fleet would behave.

---

## 3. Dashboard

Technology:

* HTML
* CSS
* JavaScript
* Socket.IO client

Requirements:

### Live Device Panel

Display:

* all rooms
* all devices
* current status
* visual indicators

Updates must occur without page refresh.

---

### Live Power Panel

Display:

* total office power
* room-wise power

Example:

```text
Total: 420W

Drawing Room: 75W
Work Room 1: 180W
Work Room 2: 165W
```

---

### Active Alert Panel

Display all unresolved alerts.

Example:

```text
[10:15 PM]
Work Room 2 still active after office hours.

[10:25 PM]
Work Room 1 fan running for more than 2 hours.
```

Alerts remain visible until resolved.

---

### Office Floor Visualization

Optional bonus features:

* top-down office layout
* glowing lights when ON
* animated fans when ON
* room highlighting
* live visual changes

---

## 4. Discord Bot

Technology:

* discord.js v14

Responsibilities:

### Respond to commands:

```text
!status
!room work1
!usage
```

Examples:

```text
Drawing Room:
1 fan ON
2 lights ON

Work Room 1:
All devices OFF
```

---

### Proactive Alerts

The bot automatically posts alerts to a Discord channel when:

* office hours violations occur
* devices run continuously for too long
* entire rooms remain active abnormally

Example:

```text
🚨 ALERT

Work Room 2 still has
2 fans and 3 lights ON
after office hours.

Did someone forget to turn them off?
```

The Discord bot does NOT poll the backend.

The backend actively pushes alert requests to the bot service.

---

# Communication Architecture

## Simulator → Backend

Protocol:

HTTP POST

Example:

```http
POST /api/device/update
```

Payload:

```json
{
    "deviceId": "work1_fan1",
    "status": true,
    "timestamp": 1751600000
}
```

---

## Backend → Dashboard

Protocol:

Socket.IO

Events:

```text
device:update
power:update
alert:new
alert:resolved
```

---

## Backend → Discord Bot

Protocol:

Internal HTTP API

Example:

```http
POST /bot/alert
```

Payload:

```json
{
    "type": "AFTER_HOURS",
    "message": "Work Room 2 still active."
}
```

---

# Alert Engine

The backend owns all alert logic.

Microcontrollers/simulators do NOT calculate alerts.

Alert rules:

---

## Rule 1

Office hours:

9:00 AM – 5:00 PM

Condition:

```text
Current time > 5PM
AND
any device is ON
```

Result:

Generate AFTER_HOURS alert.

---

## Rule 2

Condition:

```text
Device ON duration > 2 hours
```

Result:

Generate LONG_RUNNING alert.

---

## Rule 3

Condition:

```text
All devices in room ON
for more than 2 hours
```

Result:

Generate ROOM_FULLY_ACTIVE alert.

---

# State Management

Device state:

```javascript
device = {
    id,
    room,
    type,
    status,
    powerRating,
    lastChanged
}
```

Alert state:

```javascript
alert = {
    id,
    type,
    room,
    message,
    createdAt,
    resolved
}
```

Only active alerts are stored.

Resolved alerts are removed.

---

# Recovery Strategy

No database is used.

Recovery is achieved through simulator synchronization.

Simulator behavior:

* send updates on change
* send full synchronization every 60 seconds

Benefits:

* backend crashes can recover automatically
* no persistent storage required
* architecture remains compatible with future ESP32 devices

---

# Folder Structure

```text
project/

backend/
    routes/
    services/
    socket/
    state/

dashboard/
    html/
    css/
    js/

bot/
    handlers/
    services/

simulator/

docs/
    architecture/
    diagrams/
```

---

# Engineering Goals

The project should demonstrate:

* event-driven architecture
* real-time systems design
* IoT architecture principles
* websocket communication
* Discord integration
* alert processing
* service separation
* extensible hardware abstraction
* single source of truth design

The implementation should prioritize correctness, maintainability, modularity, and real-world engineering practices over unnecessary complexity.
