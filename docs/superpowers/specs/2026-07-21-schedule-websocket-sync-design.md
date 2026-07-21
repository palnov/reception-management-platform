# Design: self-hosted WebSocket sync for schedule changes

## Goal

Make schedule changes appear on all open schedule pages shortly after a successful save, without continuous database polling in the normal case. Also remove stale-client save conflicts when another user has already created or changed the shift.

The production deployment is a VPS running Next.js with SQLite and PM2. No managed realtime provider is required.

The Vercel demo deployment remains supported. It will not start or require the self-hosted WebSocket process; the schedule client will detect the missing realtime endpoint and use the existing HTTP behavior plus fallback synchronization.

## Scope

- Add a small self-hosted WebSocket server process on the same VPS.
- Keep the WebSocket process optional at runtime so the Vercel demo can build and run without it.
- Broadcast a lightweight schedule-change event only after a shift mutation has been committed successfully.
- Subscribe the schedule page to the event stream and reload only the current month's shifts when a relevant event arrives.
- Reconnect automatically after a dropped connection and synchronize once after reconnect or when the page becomes visible again.
- Keep normal HTTP save/load behavior as the fallback when WebSocket is unsupported or temporarily unavailable. For clients without WebSocket support, use a low-frequency fallback refresh rather than making the main path depend on it.
- On Vercel, where no realtime URL/process is configured, skip the WebSocket connection entirely and use the fallback path without showing a realtime error to users.
- Make single-shift and batch-shift writes recover from a stale client-side shift ID by resolving the current shift by employee and date before returning a not-found error.
- Keep SQLite as the source of truth and do not send employee or shift details through the realtime channel; the event only invalidates the affected month.

## Architecture

The repository will add a ws-based Node process, started separately by PM2 (for example, on localhost port 3006). It will expose:

- a WebSocket endpoint for authenticated browser connections;
- a loopback-only publish endpoint protected by a shared internal secret.

The browser connects to the realtime endpoint using the same host and the appropriate ws/wss scheme. The WebSocket server validates the existing session cookie before accepting a connection. The Next.js mutation routes publish an event after the SQLite write or transaction succeeds. A failed or unavailable publish call must be logged but must not turn a successful database write into a failed save response.

Event shape:

{ "type": "schedule.changed", "month": "YYYY-MM" }

On receipt, a schedule page whose current month matches the event invalidates its overview cache, fetches current-month shifts through the existing API, and applies them to local state. Pages on another month ignore the event. The existing immediate local merge after a successful own save remains in place.

## Conflict handling

For a single write with an ID that no longer exists, the API will look up the current shift by employeeId and date and update that row if present. If no row exists, it will continue through the create path. Batch writes will use the same employee/date fallback when an operation carries a stale ID.

This keeps saves idempotent for the user-visible cell and avoids exposing a generic not-found error merely because another browser changed the same date between the last refresh and the save.

## Reliability and compatibility

- The WebSocket process is isolated from the Next.js process. If it stops, the main site and database writes remain available.
- The browser reconnects with backoff and performs a fresh shift fetch after reconnect.
- A visibility-change refresh covers machines that suspend tabs or temporarily lose the socket.
- The fallback path preserves the current HTTP behavior; an optional low-frequency refresh is used only when a browser cannot establish WebSocket support.
- WebSocket is chosen over SSE because the client needs a broadly supported persistent channel and does not need a second HTTP stream per tab. The implementation will be tested on the actual browsers used on the Windows 7 workstations.

## Deployment

- Add the ws runtime dependency.
- Add a PM2 command for the realtime process and document the required REALTIME_PORT, REALTIME_PUBLISH_SECRET, and public WebSocket URL settings.
- Document that the VPS sets the public realtime URL and internal publish settings, while the Vercel demo leaves the realtime URL unset and uses fallback synchronization.
- If the VPS uses a reverse proxy, configure WebSocket upgrade forwarding; if the site is accessed directly, expose the realtime port as needed.
- No database schema migration is required.

## Testing

- Add a focused test for the event payload and publisher behavior.
- Add regression coverage for single and batch stale-ID resolution.
- Add a schedule-client contract test for WebSocket connect, relevant-month refresh, reconnect synchronization, and fallback behavior.
- Run focused tests, typecheck, lint, and a production build before completion.
