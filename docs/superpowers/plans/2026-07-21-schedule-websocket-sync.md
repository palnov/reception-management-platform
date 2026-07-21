# Self-Hosted Schedule WebSocket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ] syntax) for tracking.

**Goal:** Add self-hosted WebSocket synchronization on the VPS, preserve fallback behavior on Vercel and old browsers, and make stale schedule saves resolve the current shift instead of returning a generic error.

**Architecture:** Run a small ws-based realtime server as a second PM2 process on the VPS. Next.js shift mutation routes publish a month invalidation event after successful SQLite writes; browsers subscribed to the current month refetch shifts on that event. The realtime URL and publish settings are optional, so Vercel does not connect to or require the WebSocket process and uses fallback synchronization.

**Tech Stack:** Next.js 16 App Router, React hooks, TypeScript, Node.js, ws, jose JWT verification, SQLite/Prisma, PM2.

---

## File map

- Create: scripts/realtime-server.mjs — authenticated WebSocket server, heartbeat, and loopback publish endpoint.
- Create: lib/realtime-publisher.ts — best-effort server-side event publisher used by mutation routes.
- Create: lib/useScheduleRealtime.ts — browser WebSocket lifecycle, reconnect, visibility refresh, and fallback timer.
- Create: scripts/schedule-realtime-contract.test.mjs — source-level regression checks for the cross-process contract and Vercel fallback.
- Modify: package.json and package-lock.json — add ws and a realtime start script.
- Modify: app/schedule/ScheduleClient.tsx — subscribe the schedule page and refresh current-month shifts.
- Modify: app/api/shifts/route.ts — publish successful changes and resolve stale single-shift IDs.
- Modify: app/api/shifts/batch/route.ts — publish affected months and resolve stale batch IDs.
- Modify: DEPLOYMENT_RU.md and DEPLOYMENT_EN.md — document VPS PM2/env setup and Vercel fallback.

### Task 1: Write failing contract tests

**Files:**
- Create: scripts/schedule-realtime-contract.test.mjs

- [ ] **Step 1: Create the failing contract test**

Create scripts/schedule-realtime-contract.test.mjs with:

~~~
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

const server = read(resolve('scripts/realtime-server.mjs'));
const publisher = read(resolve('lib/realtime-publisher.ts'));
const hook = read(resolve('lib/useScheduleRealtime.ts'));
const scheduleClient = read(resolve('app/schedule/ScheduleClient.tsx'));
const shiftRoute = read(resolve('app/api/shifts/route.ts'));
const batchRoute = read(resolve('app/api/shifts/batch/route.ts'));

assert.match(server, /WebSocketServer/, 'Realtime server must expose a WebSocket server');
assert.match(server, /REALTIME_PUBLISH_SECRET/, 'Realtime publish endpoint must require an internal secret');
assert.match(server, /schedule\\.changed/, 'Realtime server must broadcast schedule.changed events');

assert.match(publisher, /publishScheduleChange/, 'Mutation routes must have a shared publisher');
assert.match(publisher, /REALTIME_PUBLISH_URL/, 'Publisher must be optional through REALTIME_PUBLISH_URL');
assert.match(publisher, /REALTIME_PUBLISH_SECRET/, 'Publisher must authenticate to the realtime process');

assert.match(hook, /NEXT_PUBLIC_REALTIME_URL/, 'Client must use an optional public realtime URL');
assert.match(hook, /new WebSocket/, 'Client must connect with the browser WebSocket API');
assert.match(hook, /visibilitychange/, 'Client must refresh after a hidden tab becomes visible');
assert.match(hook, /setInterval/, 'Client must retain a low-frequency fallback when realtime is unavailable');

assert.match(scheduleClient, /useScheduleRealtime/, 'ScheduleClient must subscribe to realtime changes');
assert.match(scheduleClient, /syncShiftsInBackground/, 'Realtime events must refresh existing schedule state');

assert.match(shiftRoute, /publishScheduleChange/, 'Single-shift mutations must publish events');
assert.match(batchRoute, /publishScheduleChange/, 'Batch mutations must publish events');
assert.match(shiftRoute, /prisma\\.shift\\.findFirst/, 'Single-shift writes must resolve a stale ID by employee/date');
assert.match(batchRoute, /existingShifts\\.find\\(s => s\\.id === op\\.id\\).*existingMap\\.get/s, 'Batch writes must fall back from stale ID to employee/date');

console.log('Schedule realtime contract checks passed');
~~~

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~
node scripts/schedule-realtime-contract.test.mjs
~~~

Expected: FAIL because the realtime server, publisher, hook, and route integrations do not exist yet. The failure must be an assertion failure, not a syntax or dependency error.

### Task 2: Add the realtime dependency and process entry point

**Files:**
- Modify: package.json
- Modify: package-lock.json
- Create: scripts/realtime-server.mjs

- [ ] **Step 1: Add ws**

Run:

~~~
npm install ws
~~~

Expected: package.json and package-lock.json add ws as a runtime dependency; no unrelated package upgrades are introduced.

- [ ] **Step 2: Create the self-hosted realtime server**

Create scripts/realtime-server.mjs. It must:

- listen on REALTIME_PORT or 3006;
- accept WebSocket upgrades only at /realtime;
- verify the session cookie with JWT_SECRET before accepting a browser;
- accept POST /publish only when x-realtime-secret equals REALTIME_PUBLISH_SECRET;
- validate event type schedule.changed and month format YYYY-MM;
- broadcast the validated JSON event to all open clients;
- send a ping every 30 seconds and remove dead connections;
- return 404 for other HTTP paths;
- shut down the HTTP server and WebSocket clients on SIGTERM/SIGINT.

Use this server shape:

~~~
import { createServer } from 'node:http';
import { jwtVerify } from 'jose';
import { WebSocketServer } from 'ws';

const host = process.env.REALTIME_HOST || '0.0.0.0';
const port = Number(process.env.REALTIME_PORT || 3006);
const jwtSecret = process.env.JWT_SECRET || '';
const publishSecret = process.env.REALTIME_PUBLISH_SECRET || '';
const clients = new Set();

function getCookie(request, name) {
  const header = request.headers.cookie || '';
  const item = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(name + '='));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : '';
}

async function isAuthenticated(request) {
  const token = getCookie(request, 'session');
  if (!token || !jwtSecret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(jwtSecret), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

function writeJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 4096) reject(new Error('Payload too large'));
    });
    request.on('end', () => resolve(JSON.parse(body || '{}')));
    request.on('error', reject);
  });
}

function broadcast(event) {
  const encoded = JSON.stringify(event);
  clients.forEach((client) => {
    if (client.readyState === 1) client.send(encoded);
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');

  if (request.method === 'POST' && url.pathname === '/publish') {
    if (!publishSecret || request.headers['x-realtime-secret'] !== publishSecret) {
      writeJson(response, 401, { error: 'Unauthorized' });
      return;
    }

    try {
      const event = await readBody(request);
      if (event.type !== 'schedule.changed' || !/^\\d{4}-\\d{2}$/.test(event.month)) {
        writeJson(response, 400, { error: 'Invalid event' });
        return;
      }

      broadcast({ type: 'schedule.changed', month: event.month });
      writeJson(response, 202, { accepted: true });
    } catch {
      writeJson(response, 400, { error: 'Invalid JSON' });
    }
    return;
  }

  writeJson(response, 404, { error: 'Not found' });
});

const websocketServer = new WebSocketServer({ noServer: true });

websocketServer.on('connection', (client) => {
  clients.add(client);
  client.isAlive = true;
  client.on('pong', () => { client.isAlive = true; });
  client.on('close', () => clients.delete(client));
  client.on('error', () => client.close());
});

server.on('upgrade', async (request, socket, head) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  if (url.pathname !== '/realtime' || !(await isAuthenticated(request))) {
    socket.write('HTTP/1.1 401 Unauthorized\\r\\n\\r\\n');
    socket.destroy();
    return;
  }

  websocketServer.handleUpgrade(request, socket, head, (client) => {
    websocketServer.emit('connection', client, request);
  });
});

const heartbeat = setInterval(() => {
  clients.forEach((client) => {
    if (!client.isAlive) {
      client.terminate();
      clients.delete(client);
      return;
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

function shutdown() {
  clearInterval(heartbeat);
  websocketServer.clients.forEach((client) => client.close());
  server.close(() => process.exit(0));
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
server.listen(port, host, () => {
  console.log('Realtime server listening on ' + host + ':' + port);
});
~~~

- [ ] **Step 3: Add a package start script**

Add this script without changing the existing start command:

~~~
"start:realtime": "node scripts/realtime-server.mjs"
~~~

### Task 3: Add the publisher and browser lifecycle hook

**Files:**
- Create: lib/realtime-publisher.ts
- Create: lib/useScheduleRealtime.ts

- [ ] **Step 1: Add the best-effort publisher**

Create lib/realtime-publisher.ts with:

~~~
const DEFAULT_REALTIME_PUBLISH_URL = 'http://127.0.0.1:3006/publish';

export async function publishScheduleChange(month: string) {
    const url = process.env.REALTIME_PUBLISH_URL || (
        process.env.REALTIME_PUBLISH_SECRET ? DEFAULT_REALTIME_PUBLISH_URL : ''
    );
    const secret = process.env.REALTIME_PUBLISH_SECRET;

    if (!url || !secret) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);

    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-realtime-secret': secret,
            },
            body: JSON.stringify({ type: 'schedule.changed', month }),
            signal: controller.signal,
        });
    } catch (error) {
        console.error('REALTIME_PUBLISH_ERROR:', error);
    } finally {
        clearTimeout(timeout);
    }
}
~~~

- [ ] **Step 2: Add the client hook**

Create lib/useScheduleRealtime.ts with a hook that:

- exits the WebSocket path when NEXT_PUBLIC_REALTIME_URL is unset or window.WebSocket is unavailable;
- creates one WebSocket for the current month;
- calls onMonthChanged only for schedule.changed events matching monthKey;
- retries after close with a bounded delay;
- refreshes once on reconnect after the first successful connection;
- listens for visibilitychange and refreshes when the tab becomes visible;
- starts a 30-second fallback interval only when no realtime URL exists, WebSocket is unsupported, or the socket is disconnected;
- clears socket, timers, and listeners on unmount or month change.

Use this public API:

~~~
'use client';

import { useEffect, useRef } from 'react';

const FALLBACK_SYNC_MS = 30000;
const RECONNECT_MS = 3000;

type ScheduleRealtimeOptions = {
    monthKey: string;
    onMonthChanged: () => void;
};

export function useScheduleRealtime({ monthKey, onMonthChanged }: ScheduleRealtimeOptions) {
    const callbackRef = useRef(onMonthChanged);
    callbackRef.current = onMonthChanged;

    useEffect(() => {
        let socket: WebSocket | null = null;
        let reconnectTimer: number | null = null;
        let fallbackTimer: number | null = null;
        let disposed = false;
        let connectedOnce = false;
        const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

        const refresh = () => callbackRef.current();

        const startFallback = () => {
            if (fallbackTimer === null) {
                fallbackTimer = window.setInterval(refresh, FALLBACK_SYNC_MS);
            }
        };

        const stopFallback = () => {
            if (fallbackTimer !== null) {
                window.clearInterval(fallbackTimer);
                fallbackTimer = null;
            }
        };

        const connect = () => {
            if (disposed) return;
            if (!realtimeUrl || typeof window.WebSocket === 'undefined') {
                startFallback();
                return;
            }

            socket = new WebSocket(realtimeUrl);
            socket.onopen = () => {
                stopFallback();
                if (connectedOnce) refresh();
                connectedOnce = true;
            };
            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'schedule.changed' && message.month === monthKey) {
                        refresh();
                    }
                } catch {
                    // Ignore malformed realtime messages.
                }
            };
            socket.onerror = () => socket?.close();
            socket.onclose = () => {
                startFallback();
                if (!disposed && reconnectTimer === null) {
                    reconnectTimer = window.setTimeout(() => {
                        reconnectTimer = null;
                        connect();
                    }, RECONNECT_MS);
                }
            };
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                refresh();
                if (socket?.readyState === WebSocket.CLOSED) connect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        connect();

        return () => {
            disposed = true;
            stopFallback();
            if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
            document.removeEventListener('visibilitychange', handleVisibility);
            socket?.close();
        };
    }, [monthKey]);

    return null;
}
~~~

### Task 4: Integrate realtime into schedule and mutation APIs

**Files:**
- Modify: app/schedule/ScheduleClient.tsx
- Modify: app/api/shifts/route.ts
- Modify: app/api/shifts/batch/route.ts

- [ ] **Step 1: Subscribe the schedule page**

Import useScheduleRealtime and call it after fetchShifts is defined:

~~~
useScheduleRealtime({
    monthKey: currentMonthKey,
    onMonthChanged: syncShiftsInBackground,
});
~~~

Keep the existing local merge after own saves. The WebSocket event is for other tabs/users and the fallback path.

- [ ] **Step 2: Publish after every successful single-shift mutation**

Import publishScheduleChange from lib/realtime-publisher. Before each successful shift response in app/api/shifts/route.ts, call:

~~~
await publishScheduleChange(date.slice(0, 7));
~~~

Add this after the database update/create succeeds and before returning the JSON response. Add the same call after a successful soft delete using existingShift.date.slice(0, 7).

- [ ] **Step 3: Publish affected months after the batch transaction**

In the batch route, collect month keys from operations and deleteIds' loaded shifts. After all delete/upsert database work succeeds, publish once per changed month:

~~~
await Promise.all([...changedMonths].map((month) => publishScheduleChange(month)));
~~~

The publisher already catches transport errors, so a realtime outage must not make the batch mutation fail.

- [ ] **Step 4: Resolve stale IDs in the single-shift route**

Change the ID lookup so an absent ID falls back to the current employee/date row:

~~~
const existingById = id ? await prisma.shift.findUnique({ where: { id } }) : null;
const existing = existingById || await prisma.shift.findFirst({
    where: { employeeId, date },
});
~~~

Use existing for the current update/authorization path. Only return Not found if both lookups are empty.

- [ ] **Step 5: Resolve stale IDs in the batch route**

Use the employee/date map when an operation ID is stale:

~~~
const existing = op.id
    ? existingShifts.find((shift) => shift.id === op.id) || existingMap.get(op.employeeId + '_' + op.date)
    : existingMap.get(op.employeeId + '_' + op.date);
~~~

Use this lookup consistently for archive-work authorization and for the transaction's update/create decision.

### Task 5: Configure VPS and preserve Vercel fallback

**Files:**
- Modify: DEPLOYMENT_RU.md
- Modify: DEPLOYMENT_EN.md

- [ ] **Step 1: Document VPS environment values**

Document these VPS settings:

~~~
PORT=3005
REALTIME_PORT=3006
REALTIME_PUBLISH_URL=http://127.0.0.1:3006/publish
REALTIME_PUBLISH_SECRET=<long-random-secret>
NEXT_PUBLIC_REALTIME_URL=ws://<public-host>:3006/realtime
~~~

For HTTPS, document the wss URL and reverse-proxy WebSocket upgrade requirement.

- [ ] **Step 2: Document PM2 startup**

Add:

~~~
pm2 start npm --name "staff-manager-realtime" -- run start:realtime
pm2 save
~~~

Add the corresponding restart command to the update procedure.

- [ ] **Step 3: Document Vercel behavior**

State that Vercel must leave REALTIME_PUBLISH_URL, REALTIME_PUBLISH_SECRET, and NEXT_PUBLIC_REALTIME_URL unset. The demo then skips WebSocket setup and uses fallback synchronization without requiring a second process.

### Task 6: Verify, build, and commit

**Files:**
- Test: scripts/schedule-realtime-contract.test.mjs
- All implementation files above

- [ ] **Step 1: Run focused contract checks**

Run:

~~~
node scripts/schedule-realtime-contract.test.mjs
~~~

Expected: exit code 0 and print Schedule realtime contract checks passed.

- [ ] **Step 2: Run project checks**

Run:

~~~
npm run typecheck
npm run lint
~~~

Expected: both commands exit with code 0.

- [ ] **Step 3: Build the production app**

Run:

~~~
npm run build
~~~

Expected: exit code 0. Confirm the build does not try to start scripts/realtime-server.mjs and succeeds with realtime environment variables unset.

- [ ] **Step 4: Inspect scope and clean up**

Run:

~~~
git diff --check
git status --short --branch
~~~

Expected: no whitespace errors and no untracked or modified files after commit.

- [ ] **Step 5: Commit implementation**

Run:

~~~
git add package.json package-lock.json scripts/realtime-server.mjs scripts/schedule-realtime-contract.test.mjs lib/realtime-publisher.ts lib/useScheduleRealtime.ts app/schedule/ScheduleClient.tsx app/api/shifts/route.ts app/api/shifts/batch/route.ts DEPLOYMENT_RU.md DEPLOYMENT_EN.md
git commit -m "feat: add self-hosted schedule realtime sync"
~~~

Expected: one implementation commit containing WebSocket sync, Vercel fallback, conflict recovery, deployment docs, and regression coverage.

