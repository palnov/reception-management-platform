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
# Add DATABASE_URL="file:./dev.db"
# Add JWT_SECRET="your-super-long-random-secret-string"
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
pm2 start npm --name "pdmc-hr" -- start

# Save PM2 state to restart on reboot
pm2 save
pm2 startup
```

## 5. Reverse Proxy (Nginx)

Configure Nginx to serve the application on port 80:

```bash
sudo nano /etc/nginx/sites-available/pdmc-hr
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
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

## 7. Data Backups

Since the application uses SQLite, your database is the file `dev.db` (or whatever is in `.env`). 
Make sure to include it in your regular VPS backup schedule.
You can also use the built-in **Backup** feature in the "Data" section of the application to regularly download snapshots.
