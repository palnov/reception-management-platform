const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (process.env.VERCEL) {
  console.log('Detected Vercel environment. Switching Prisma provider to postgresql...');
  schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('Prisma provider switched to postgresql.');
} else {
  console.log('Local environment. Keeping Prisma provider as original.');
}
