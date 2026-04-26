const { randomBytes, scryptSync } = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${HASH_PREFIX}$${salt}$${derivedKey.toString('hex')}`;
}

async function main() {
  const employees = await prisma.employee.findMany({
    where: {
      NOT: {
        password: {
          startsWith: `${HASH_PREFIX}$`,
        },
      },
    },
    select: { id: true, password: true },
  });

  if (employees.length === 0) {
    console.log('OK   no legacy plaintext passwords found');
    return;
  }

  await prisma.$transaction(
    employees.map((employee) =>
      prisma.employee.update({
        where: { id: employee.id },
        data: { password: hashPassword(employee.password) },
      }),
    ),
  );

  console.log(`OK   migrated ${employees.length} legacy password(s) to scrypt`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
