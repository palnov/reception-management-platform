import { createServer } from 'node:http';
import 'dotenv/config';
import { jwtVerify } from 'jose';
import { WebSocketServer } from 'ws';

const host = process.env.REALTIME_HOST || '0.0.0.0';
const port = Number(process.env.REALTIME_PORT || 3006);
const jwtSecret = process.env.JWT_SECRET || '';
const publishSecret = process.env.REALTIME_PUBLISH_SECRET || '';
const clients = new Set();

function getCookie(request, name) {
  const header = request.headers.cookie || '';
  const item = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(name + '='));

  if (!item) return '';

  try {
    return decodeURIComponent(item.slice(name.length + 1));
  } catch {
    return '';
  }
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
    let tooLarge = false;

    request.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (body.length > 4096) {
        tooLarge = true;
        reject(new Error('Payload too large'));
      }
    });
    request.on('end', () => {
      if (!tooLarge) {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (error) {
          reject(error);
        }
      }
    });
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
      if (event.type !== 'schedule.changed' || !/^\d{4}-\d{2}$/.test(event.month)) {
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
  client.on('pong', () => {
    client.isAlive = true;
  });
  client.on('close', () => clients.delete(client));
  client.on('error', () => client.close());
});

server.on('upgrade', async (request, socket, head) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  if (url.pathname !== '/realtime' || !(await isAuthenticated(request))) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
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
