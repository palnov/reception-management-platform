---
description: how to deploy the application on a VPS (Production Mode)
---

# Deploying HR Platform to VPS

This guide outlines the recommended process for deploying this Next.js + Prisma (SQLite) application to a Linux VPS (Ubuntu/Debian).

## 1. Environment Setup

Connect to your VPS and install required dependencies:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

## 2. Project Deployment

Clone your repository and install dependencies:

```bash
# Clone the repository
git clone <your-repo-url> pdmc-hr
cd pdmc-hr

# Install dependencies
npm install

# Setup Environment Variables
nano .env

# REQUIRED: Path to your SQLite database
DATABASE_URL="file:./dev.db"

# REQUIRED: Secret key for signing JWT sessions. 
# Use a long random string (e.g., generated with `openssl rand -base64 32`)
JWT_SECRET="your-super-long-random-secret-string"

# OPTIONAL: Port to run the application on (default is 3000)
# If 3000 is occupied, set another one (e.g., 4000)
PORT=3000
```

## 3. Database Initialization

Run migrations and generate Prisma client:

```bash
# Apply migrations to production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 4. Building and Running

Build the application and start it with PM2:

```bash
# Build for production
npm run build

# Start with PM2
# IMPORTANT: Use the -- flag to pass arguments like port (-p) and host (-H) to Next.js
# -H 0.0.0.0 is required to allow external access (not just localhost)
pm2 start npm --name "pdmc-hr" -- start -- -p 3005 -H 0.0.0.0

# --- PERSISTENCE (Auto-restart on reboot) ---
# 1. Save the current process list (and their arguments like -p 3005)
pm2 save

# 2. Setup system startup script
pm2 startup
# !!! AFTER running 'pm2 startup', copy, paste, and run the command it provides in your terminal !!!
# ---------------------------------------------
```

## 5. Reverse Proxy (Nginx)

Configure Nginx to serve the application on port 80. 
**IMPORTANT**: The `proxy_pass` port must match the `PORT` specified in your `.env` file.

```bash
sudo nano /etc/nginx/sites-available/pdmc-hr
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000; # Change 3000 to your PORT if changed
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/pdmc-hr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL Security (Optional but Recommended)

Use Certbot for free HTTPS:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 7. Troubleshooting: Firewall and Ports

If you can access the app via `curl http://localhost:PORT` inside the server but see a "Timeout" or "502 Bad Gateway" (from Cloudflare) in your browser:

1.  **Open the port in Ubuntu Firewall**:
    ```bash
    sudo ufw allow 3005 # Replace 3005 with your PORT
    ```
2.  **Check IP binding**: 
    Ensure you start the app with `-H 0.0.0.0` to listen on all network interfaces:
    ```bash
    pm2 start npm --name "pdmc-hr" -- start -- -p 3005 -H 0.0.0.0
    ```

## 8. Data Backups

Since the application uses SQLite, your database is the file `dev.db` (or whatever is in `.env`). 
Make sure to include it in your regular VPS backup schedule.
You can also use the built-in **Backup** feature in the "Data" section of the application to regularly download snapshots.
