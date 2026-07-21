---
description: how to deploy the application on a VPS (Production Mode)
---

# Deploying HR Platform to VPS

This guide covers the production setup on a Linux VPS with Next.js, Prisma, SQLite, Nginx, and two PM2 processes:

- `staff-manager` — the main Next.js application;
- `staff-manager-realtime` — the self-hosted WebSocket server for schedule events.

Vercel does not use the second process. See `DEPLOYMENT_RU.md` or `DEPLOYMENT_EN.md` for the complete deployment guide.

## 1. Install server dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.9+ (required by Next.js 16)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2
sudo apt install -y nginx
```

## 2. Clone or update the project

For a new server:

```bash
git clone <your-repo-url> /root/pdmc-rm
cd /root/pdmc-rm
npm ci
```

For an existing installation:

```bash
cd /root/pdmc-rm
git pull --ff-only
npm ci
```

Use `npm ci`, not `npm audit fix --force`. The lockfile is the source of truth for the VPS versions.

## 3. Configure the environment

Create or edit `/root/pdmc-rm/.env`:

```env
DATABASE_URL="file:./dev.db"
PORT=3005

# Keep the existing value if the application already has one.
JWT_SECRET="your-existing-auth-secret"

REALTIME_PORT=3006
REALTIME_PUBLISH_URL="http://127.0.0.1:3006/publish"
REALTIME_PUBLISH_SECRET="separate-long-publish-secret"
NEXT_PUBLIC_REALTIME_URL="ws://your-domain-or-ip:3006/realtime"
```

Generate a new random secret when needed:

```bash
openssl rand -hex 32
```

`REALTIME_PUBLISH_SECRET` is shared by the Next.js and realtime processes. It is an internal secret and must not be exposed in the browser or committed to GitHub.

`JWT_SECRET` must be the same value used by the main application and the realtime server. Do not change an existing production value unless you intend to invalidate all current sessions.

`REALTIME_PUBLISH_URL` is internal and should normally remain `http://127.0.0.1:3006/publish`. `NEXT_PUBLIC_REALTIME_URL` is different: it must be reachable from users' browsers. Never use `127.0.0.1` for the public value.

For direct HTTP access, use:

```env
NEXT_PUBLIC_REALTIME_URL="ws://your-public-ip:3006/realtime"
```

For an HTTPS domain, use `wss://your-domain/realtime` and proxy the path through Nginx:

```nginx
location /realtime {
    proxy_pass http://127.0.0.1:3006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

Check and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Open port `3006` only for the direct `ws://...:3006` option:

```bash
sudo ufw allow 3006/tcp
```

## 4. Initialize and build

```bash
cd /root/pdmc-rm
npx prisma db push
npm run migrate:passwords
npm run build
```

Run `npm run migrate:passwords` only when upgrading an existing installation that may contain legacy passwords. `NEXT_PUBLIC_REALTIME_URL` must be present before `npm run build`, because it is embedded in the client bundle.

## 5. Start and persist both PM2 processes

```bash
pm2 start npm --name "staff-manager" -- start -- -p 3005 -H 0.0.0.0
pm2 start npm --name "staff-manager-realtime" -- run start:realtime
pm2 startup
```

Run the command printed by `pm2 startup` to enable startup after reboot.

Then save the process list:

```bash
pm2 save
```

## 6. Update an existing deployment

```bash
cd /root/pdmc-rm
git pull --ff-only
npm ci
npm run build
pm2 restart staff-manager --update-env
pm2 restart staff-manager-realtime --update-env
pm2 save
```

If `prisma/schema.prisma` changed, run `npx prisma db push` before the build. If the VPS was changed by `npm audit fix --force`, `npm ci` restores the versions from `package-lock.json`.

## 7. Verify the service

```bash
curl http://127.0.0.1:3006/health
pm2 status
pm2 logs staff-manager-realtime --lines 100 --nostream
```

The health endpoint should return `ok: true`. Its `clients` value should increase when browsers open the schedule. A successful publication is logged as:

```text
Published schedule.changed for 2026-07 to 2 client(s)
```

The browser console should contain:

```text
[SCHEDULE_REALTIME] WebSocket connected.
```

If `NEXT_PUBLIC_REALTIME_URL` is missing, the browser logs a warning and uses the 30-second fallback. If the publish secret or URL is wrong, the Next.js process logs `REALTIME_PUBLISH_ERROR`.

## 8. Backups

The SQLite database is the file specified by `DATABASE_URL`, normally `dev.db`. Include it in the VPS backup schedule. The application also provides a backup feature in the Data section.
