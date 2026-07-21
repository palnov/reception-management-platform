# Deployment Guide

The project supports two deployment modes:

- Vercel + Neon — demo deployment. It does not run a separate realtime process and uses fallback synchronization.
- VPS + SQLite — production deployment. It runs the Next.js application and a separate WebSocket process managed by PM2.

## 1. Vercel deployment

Configure these variables in Vercel:

- `DATABASE_URL` — the Neon connection string.
- `JWT_SECRET` — a long authentication secret. Keep it the same in every Vercel environment where users log in.

Leave these realtime variables unset or empty in Vercel:

- `NEXT_PUBLIC_REALTIME_URL`
- `REALTIME_PUBLISH_URL`
- `REALTIME_PUBLISH_SECRET`
- `REALTIME_PORT`

The demo will skip the WebSocket connection and use fallback synchronization automatically.

### First deployment

1. Create a Vercel project and connect the GitHub repository.
2. Add `DATABASE_URL` and `JWT_SECRET` in Project → Settings → Environment Variables.
3. For the initial Neon setup, add `NEON_DATABASE_URL` to the local `.env` and run:

   ```bash
   npm run sync-neon
   ```

4. If the database is empty, open `/setup` on the Vercel domain and create the first user.

### Updating the project

1. Push changes to GitHub; Vercel will start a new deployment.
2. If `schema.prisma` changed, run `npm run sync-neon` locally after the push.
3. Redeploy after changing Vercel environment variables.

Do not add VPS realtime secrets to GitHub or try to start the WebSocket process on Vercel.

## 2. VPS deployment

The examples below use `/root/pdmc-rm`, Next.js port `3005`, and realtime port `3006`. Replace them if your server uses different paths or ports.

The current Next.js version requires Node.js `20.9+`.

### Install dependencies

```bash
cd /root/pdmc-rm
npm ci
```

`npm ci` installs the versions from `package-lock.json`. Do not run `npm audit fix --force` on the VPS: it can rewrite the lockfile, upgrade Next.js outside the pinned version, or downgrade packages such as ExcelJS.

### Configure `.env`

Keep the environment file in the project root on the VPS. Never commit it to GitHub.

```bash
cd /root/pdmc-rm
cp .env .env.backup-$(date +%F-%H%M) 2>/dev/null || true
nano .env
```

Example:

```env
DATABASE_URL="file:./dev.db"
PORT=3005

# Keep the existing value if the application already has one.
JWT_SECRET="your-existing-auth-secret"

REALTIME_PORT=3006

# Internal VPS-only publisher address.
REALTIME_PUBLISH_URL="http://127.0.0.1:3006/publish"

# Generate a separate long secret and use the same value for both processes.
REALTIME_PUBLISH_SECRET="separate-long-publish-secret"

# Public address used by browsers. Do not use 127.0.0.1 here.
NEXT_PUBLIC_REALTIME_URL="ws://your-domain-or-ip:3006/realtime"
```

Generate a long random secret with:

```bash
openssl rand -hex 32
```

Keep the existing `JWT_SECRET` if one is already configured. Changing it invalidates existing login sessions.

### Choose the public WebSocket URL

For direct HTTP access, for example `http://203.0.113.10:3005`, with port `3006` reachable from users' computers:

```env
NEXT_PUBLIC_REALTIME_URL="ws://203.0.113.10:3006/realtime"
```

For an HTTPS domain, use the same domain through an Nginx WebSocket proxy:

```env
NEXT_PUBLIC_REALTIME_URL="wss://hr.example.com/realtime"
```

Add this route before the general `location /` block:

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

Then validate and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

When using a direct `ws://...:3006` address, open the port:

```bash
sudo ufw allow 3006/tcp
```

Do not expose port `3006` publicly when Nginx proxies `wss://` traffic to it.

`NEXT_PUBLIC_REALTIME_URL` is embedded into the browser bundle, so it must be set before `npm run build`.

### Initialize, build, and start

```bash
cd /root/pdmc-rm
npx prisma db push
npm run migrate:passwords
npm run build

pm2 start npm --name "staff-manager" -- start -- -p 3005 -H 0.0.0.0
pm2 start npm --name "staff-manager-realtime" -- run start:realtime
pm2 startup
```

After `pm2 startup`, execute the command printed by PM2.

Then save the process list:

```bash
pm2 save
```

### Update an existing VPS

```bash
cd /root/pdmc-rm
git pull --ff-only
npm ci

# Only when prisma/schema.prisma changed:
# npx prisma db push
# npm run migrate:passwords

npm run build
pm2 restart staff-manager --update-env
pm2 restart staff-manager-realtime --update-env
pm2 save
```

### Verify realtime

```bash
curl http://127.0.0.1:3006/health
pm2 status
pm2 logs staff-manager-realtime --lines 100 --nostream
```

Expected health response:

```json
{"ok":true,"clients":0,"configured":true,"port":3006}
```

After opening the schedule in a browser, the client count should increase. When a change is published, the realtime log should contain a line like:

```text
Published schedule.changed for 2026-07 to 2 client(s)
```

The browser console should show:

```text
[SCHEDULE_REALTIME] WebSocket connected.
```

### Troubleshooting

- `WebSocket URL is not configured` means `NEXT_PUBLIC_REALTIME_URL` was missing during the build. Fix `.env` and run `npm run build` again.
- `clients: 0` while the schedule is open means the browser cannot connect; check the public URL, firewall, Nginx, and `ws`/`wss` scheme.
- `REALTIME_PUBLISH_ERROR` means the realtime process is unavailable or `REALTIME_PUBLISH_SECRET` does not match.
- After a previous `npm audit fix --force`, run `npm ci` to restore the lockfile versions. Check with `npm ls exceljs next --depth=0`.

Two computers using the same account still receive realtime updates. They are only treated as the same editor for the audit icon, so the “changed by another employee” icon is hidden for that same account.

## Command reference

| Command | Purpose |
| :--- | :--- |
| `npm ci` | Install dependencies from `package-lock.json` |
| `npm run build` | Build production code and embed `NEXT_PUBLIC_REALTIME_URL` |
| `npm run start:realtime` | Start the WebSocket server manually |
| `curl http://127.0.0.1:3006/health` | Check the realtime process |
| `pm2 restart staff-manager --update-env` | Restart Next.js after a build |
| `pm2 restart staff-manager-realtime --update-env` | Restart the WebSocket process |
| `npm run sync-neon` | Sync Neon for Vercel |
| `npx prisma db push` | Sync SQLite with the Prisma schema |
