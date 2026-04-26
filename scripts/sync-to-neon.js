const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEMA_PATH = path.join(process.cwd(), 'prisma', 'schema.prisma');
const ENV_PATH = path.join(process.cwd(), '.env');

function main() {
  console.log('--- NEON SYNC START ---');

  // Load .env
  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  if (!envContent.includes('NEON_DATABASE_URL')) {
    console.error('Error: NEON_DATABASE_URL not found in .env');
    process.exit(1);
  }

  // Backup schema
  const originalSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  try {
    // 1. Temporarily swap schema to PostgreSQL and NEON_DATABASE_URL
    console.log('Switching schema to PostgreSQL/Neon...');
    let tempSchema = originalSchema
      .replace(/provider = "sqlite"/, 'provider = "postgresql"')
      .replace(/env\("DATABASE_URL"\)/, 'env("NEON_DATABASE_URL")');
    fs.writeFileSync(SCHEMA_PATH, tempSchema);

    // 2. Perform db push
    console.log('Synchronizing with Neon (npx prisma db push)...');

    // Pass any arguments from the command line (like --accept-data-loss)
    const args = process.argv.slice(2).join(' ');
    execSync(`npx prisma db push ${args}`, { stdio: 'inherit' });

    // 3. Generate a temporary Prisma client for the Neon datasource and
    // migrate old plaintext passwords there. The login route can upgrade
    // legacy passwords lazily, but doing it here keeps production data tidy.
    console.log('Generating temporary Prisma client for Neon...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Migrating legacy plaintext passwords in Neon...');
    execSync('node scripts/migrate-legacy-passwords.js', { stdio: 'inherit' });

    console.log('✅ Synchronization with Neon successful!');
  } catch (err) {
    console.error('❌ Synchronization failed:', err.message);
  } finally {
    // 4. Restore original schema and local Prisma client
    console.log('Restoring local schema (sqlite)...');
    fs.writeFileSync(SCHEMA_PATH, originalSchema);
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('--- NEON SYNC END ---');
  }
}

main();
