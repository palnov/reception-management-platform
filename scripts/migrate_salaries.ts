
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting salary history migration...');
  
  const employees = await prisma.employee.findMany();
  
  for (const emp of employees) {
    const existingHistory = await (prisma as any).employeeSalaryHistory.findFirst({
      where: { employeeId: emp.id }
    });
    
    if (!existingHistory) {
      const startDate = emp.hireDate || '2024-01-01';
      // Normalize to 1st of the month
      const normalizedStart = startDate.substring(0, 7) + '-01';
      
      await (prisma as any).employeeSalaryHistory.create({
        data: {
          employeeId: emp.id,
          baseSalary: emp.baseSalary,
          hourlyRate: emp.hourlyRate,
          startDate: normalizedStart,
          endDate: null
        }
      });
      console.log(`Created initial salary history for ${emp.name} starting ${normalizedStart}`);
    } else {
      console.log(`Salary history already exists for ${emp.name}, skipping.`);
    }
  }
  
  console.log('Migration completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
