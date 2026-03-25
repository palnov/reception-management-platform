# Deployment Guide - EN

This guide will help you correctly deploy or update your project.

## 1. Deployment to Vercel (Demo version with Neon DB)

### For FIRST-TIME Deployment (Fresh Install):
1.  **Create a project on Vercel** and link your repository.
2.  **Configure Environment Variables** in the Vercel dashboard:
    *   `DATABASE_URL` — the connection string from your Neon dashboard.
    *   `JWT_SECRET` — any long random string.
3.  **Sync the database** from your computer ONCE:
    *   Add `NEON_DATABASE_URL="your-neon-url"` to your local `.env` file.
    *   Run `npm run sync-neon`. This will create all tables and initial settings in Neon.
4.  **Done!** Vercel will automatically build the project.

### When UPDATING the project (Changes made):
1.  **Push to GitHub**: Just push your changes to the repository. Vercel will detect them and start a new build.
2.  **If you modified the database (schema.prisma)**:
    *   After pushing to GitHub, run locally on your machine:
        ```bash
        npm run sync-neon
        ```
    *   This will "push" new tables or fields to the Neon database. Your existing data will not be deleted.

---

## 2. Deployment to VPS (Production version with SQLite DB)

### For FIRST-TIME Deployment (Fresh Install):
1.  **Clone the repository** to your server and install dependencies: `npm install`.
2.  **Create a `.env` file** on the server and specify:
    *   `DATABASE_URL="file:./dev.db"`
    *   `JWT_SECRET="your-secret-string"`
    *   `PORT=3005`
3.  **Initialize the database**:
    ```bash
    npx prisma db push
    ```
4.  **Build the project**:
    ```bash
    npm run build
    ```
5.  **Start with PM2**:
    ```bash
    pm2 start npm --name "staff-manager" -- start -- -p 3005 -H 0.0.0.0
    ```
6.  **Setup the Admin**: Open `http://your-ip:3000/setup` in your browser and create the first user.

### When UPDATING the project (Changes made):
1.  **Connect to your server** and pull the code:
    ```bash
    git pull
    ```
2.  **If you modified the database (schema.prisma)**:
    ```bash
    npx prisma db push
    ```
3.  **Build and restart**:
    ```bash
    npm run build
    pm2 restart staff-manager
    ```

---

## Command Quick Reference

| Command | What it does | When to use |
| :--- | :--- | :--- |
| `npm run build` | Compiles Next.js for production | Every time you update the code |
| `npm run sync-neon` | Updates Neon structure and seeds it | On `schema.prisma` changes (for Vercel) |
| `npx prisma db push` | Syncs SQLite with your code | On `schema.prisma` changes (for VPS) |
| `pm2 restart [name]` | Restarts the running application | After `build` on VPS |
