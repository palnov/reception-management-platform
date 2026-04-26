const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const REQUIRED_TABLES = [
  'Employee',
  'Shift',
  'KpiRecord',
  'MonthlyNorm',
  'MonthlyChecklist',
  'PromotionSale',
  'RegistrationKpi',
  'DailyChecklist',
  'ClosedMonth',
  'EmployeeRoleHistory',
  'EmployeeSalaryHistory',
  'AuditLog',
];

const REQUIRED_COLUMNS = {
  Employee: ['id', 'name', 'role', 'password', 'hireDate', 'dismissalDate', 'seniorId'],
  Shift: ['id', 'date', 'employeeId', 'type', 'hours', 'isDeleted', 'isActingLead', 'isTrainee'],
  DailyChecklist: ['id', 'date', 'employeeId', 'criterion1', 'criterion6', 'totalScore'],
  ClosedMonth: ['month', 'isClosed'],
  EmployeeRoleHistory: ['employeeId', 'role', 'seniorId', 'startDate', 'endDate'],
  EmployeeSalaryHistory: ['employeeId', 'baseSalary', 'hourlyRate', 'startDate', 'endDate'],
};

function ok(message) {
  console.log(`OK   ${message}`);
}

function warn(message) {
  console.warn(`WARN ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function getTableColumns(tableName) {
  const columns = await prisma.$queryRawUnsafe(`PRAGMA table_info('${tableName}')`);
  return columns.map((column) => column.name);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail('DATABASE_URL is missing');
  }
  ok('DATABASE_URL is configured');

  if (!process.env.JWT_SECRET) {
    warn('JWT_SECRET is missing. Dev fallback may work, but production must set it.');
  } else if (process.env.JWT_SECRET.length < 32) {
    warn('JWT_SECRET is shorter than 32 characters');
  } else {
    ok('JWT_SECRET is configured');
  }

  const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table'");
  const tableNames = new Set(tables.map((table) => table.name));

  for (const table of REQUIRED_TABLES) {
    if (!tableNames.has(table)) fail(`Missing table: ${table}`);
  }
  ok('all critical tables exist');

  for (const [table, requiredColumns] of Object.entries(REQUIRED_COLUMNS)) {
    const columns = await getTableColumns(table);
    const missing = requiredColumns.filter((column) => !columns.includes(column));
    if (missing.length > 0) fail(`Table ${table} is missing columns: ${missing.join(', ')}`);
  }
  ok('critical columns exist');

  const employeeCount = await prisma.employee.count();
  const shiftCount = await prisma.shift.count();
  const migrationCount = await prisma.$queryRawUnsafe('SELECT COUNT(*) AS count FROM _prisma_migrations');
  ok(`database reachable: employees=${employeeCount}, shifts=${shiftCount}, migrations=${String(migrationCount[0]?.count ?? 0)}`);

  await prisma.closedMonth.findUnique({ where: { month: '2026-04' } });
  await prisma.dailyChecklist.findMany({
    where: { date: { gte: '2026-04-01', lte: '2026-04-30' } },
    include: { employee: { select: { id: true, name: true } } },
    take: 1,
  });
  await prisma.employee.findMany({
    take: 1,
    select: {
      id: true,
      name: true,
      role: true,
      hireDate: true,
      dismissalDate: true,
      seniorId: true,
      roleHistory: { take: 1 },
      salaryHistory: { take: 1 },
    },
  });
  await prisma.shift.findMany({
    where: { isDeleted: false },
    include: { employee: { select: { id: true, name: true } } },
    take: 1,
  });
  ok('critical Prisma queries work');

  const legacyPasswordCount = await prisma.employee.count({
    where: {
      NOT: {
        password: {
          startsWith: 'scrypt$',
        },
      },
    },
  });

  if (legacyPasswordCount > 0) {
    warn(`${legacyPasswordCount} employee password(s) are still legacy plaintext format; they will upgrade on successful login`);
  } else {
    ok('all employee passwords use scrypt format');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
