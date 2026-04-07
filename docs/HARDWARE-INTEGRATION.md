# Hardware Integration (Phase 4)

> Louis mentioned wanting to ship optional hardware that programs directly to machines and feeds data into Easy OEE automatically. This doc captures the plan so we don't paint the data model into a corner before we get there.

## Goal

Give customers a hardware add-on that:
1. Watches a machine's actual state (running / stopped)
2. Counts parts in real time (sensor or PLC tag)
3. POSTs that data to Easy OEE so the operator no longer has to log every stop manually
4. Lets operators still **categorize** stops (the device knows the machine is down; the human knows *why*)

This is a meaningful upsell — it transforms Easy OEE from "easy data entry" into "actually no data entry, just classification."

## Architecture

```
                  Shop floor                              Cloud
┌──────────────────────────────────┐         ┌────────────────────────┐
│ Machine PLC / sensor             │         │  Easy OEE              │
│   │                              │         │  /api/ingest           │
│   │ digital input / Modbus / OPC │         │  ┌──────────────────┐  │
│   ▼                              │         │  │ Validate API key │  │
│ Gateway device                   │ HTTPS   │  │ → companyId      │  │
│ (Raspberry Pi 5 or Advantech)    │ POST ───┼─►│ → lineId         │  │
│  - reads PLC tags every 1s       │ JSON    │  │                  │  │
│  - debounces state changes       │         │  │ Find/create live │  │
│  - buffers offline               │         │  │ shift on this    │  │
│  - sends batched events          │         │  │ line             │  │
└──────────────────────────────────┘         │  │                  │  │
                                             │  │ Insert/close stop│  │
                                             │  │ Update parts cnt │  │
                                             │  │ Bump device      │  │
                                             │  │ last_seen_at     │  │
                                             │  └──────────────────┘  │
                                             └────────────────────────┘
```

## Data model touchpoints (already in v1)

We add the device-aware fields **now** so we never have to migrate later:

- `shifts.data_source` — `manual` | `device` | `mixed`
- `stops.data_source` — `manual` | `device`
- `devices` table — `id, company_id, line_id, name, api_key_hash, last_seen_at`

## API

### `POST /api/ingest`

**Auth:** `Authorization: Bearer <api_key>` — looked up against `devices.api_key_hash` (bcrypt). API key is generated once when the manager pairs a device, shown to them once, never stored in plain text.

**Body** (one of):

```json
// Stop started
{ "type": "stop_started", "ts": "2026-04-06T14:32:11Z", "reason": null }

// Stop ended
{ "type": "stop_ended", "ts": "2026-04-06T14:35:02Z" }

// Parts increment
{ "type": "parts", "ts": "2026-04-06T14:32:11Z", "good": 12, "bad": 0 }

// Heartbeat
{ "type": "heartbeat", "ts": "2026-04-06T14:32:11Z" }
```

**Behavior:**
- Look up `device` by API key → get `companyId`, `lineId`
- Find the active `shift` on this line; if none exists and the device sends a stop or parts event, **auto-create** a shift with `data_source = 'device'` and shift_type inferred from time-of-day
- For stops, the reason is `null` (device doesn't know why) — operator categorizes later from the shift page
- Update `device.last_seen_at` on every request
- Return 200 with the shift id

### Operator override

Even with a device, the operator can still tap stop buttons in the UI. We merge:
- Device says "machine stopped at 14:32" → creates an `Stop` with `reason = null`
- Operator taps "Mechanical Failure" within X minutes of an unreasoned stop → we set the reason on the existing stop instead of creating a new one
- Operator taps a reason with no recent device stop → we create a manual stop as today

## Hardware target

**Tier 1 (DIY-friendly):** Raspberry Pi 5 + a USB-RS485 adapter, polling Modbus RTU on the PLC. Bill of materials < $200 CAD. Ships with our flashed SD card.

**Tier 2 (industrial):** Advantech ADAM-6717 or Moxa ioLogik. More expensive but UL-listed and rugged. Sold as a "managed device" SKU.

**Firmware (both tiers):** Node.js daemon (or Rust binary) that:
- Reads config from `/etc/easy-oee/config.json` (API URL, API key, PLC type, tags)
- Polls every 1s, debounces state for 5s before reporting a stop
- Buffers events to local SQLite when offline; flushes on reconnect
- Auto-updates over the air (signed binaries from Easy OEE's S3 bucket)

## Pairing flow (UX)

1. Manager goes to `/dashboard/lines/[id]` → "Add device"
2. Form: device name, hardware tier
3. We generate an API key, show it once with a "copy + flash" button
4. Manager flashes the SD card (or scans a QR code on a pre-flashed device) which configures the API key
5. Device boots, sends a heartbeat, manager sees "Device online" in the dashboard

## Open questions

- [ ] Tier 1 vs Tier 2 — do we sell both or pick one?
- [ ] Modbus is universal but slow. OPC-UA is the modern standard. Support both or pick one for v1?
- [ ] Do we sell hardware ourselves (logistics, returns, support) or partner with a distributor?
- [ ] What's the markup model — flat $X/device + monthly software, or bundled price?
- [ ] How do we handle UL/CSA compliance for shipping to Canadian factories?

These don't block v1. We build the API, the schema, the pairing flow stub, and the data model — and revisit when we have a customer asking for it.
