-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthlyChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "percentage" REAL NOT NULL DEFAULT 0,
    "sickLeaveOpening" INTEGER NOT NULL DEFAULT 0,
    "sickLeaveClosing" INTEGER NOT NULL DEFAULT 0,
    "cardCreation" INTEGER NOT NULL DEFAULT 0,
    "closingBonus" INTEGER NOT NULL DEFAULT 0,
    "certificates" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "updatedBy" TEXT,
    CONSTRAINT "MonthlyChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MonthlyChecklist" ("cardCreation", "createdAt", "employeeId", "id", "month", "percentage", "sickLeaveClosing", "sickLeaveOpening", "updatedAt", "updatedBy") SELECT "cardCreation", "createdAt", "employeeId", "id", "month", "percentage", "sickLeaveClosing", "sickLeaveOpening", "updatedAt", "updatedBy" FROM "MonthlyChecklist";
DROP TABLE "MonthlyChecklist";
ALTER TABLE "new_MonthlyChecklist" RENAME TO "MonthlyChecklist";
CREATE UNIQUE INDEX "MonthlyChecklist_month_employeeId_key" ON "MonthlyChecklist"("month", "employeeId");
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hireDate" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "password" TEXT NOT NULL DEFAULT '1234',
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "branch" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "dismissalDate" TEXT NOT NULL DEFAULT '',
    "seniorId" TEXT,
    CONSTRAINT "Employee_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("baseSalary", "branch", "createdAt", "dismissalDate", "hireDate", "hourlyRate", "id", "name", "password", "role", "sortOrder") SELECT "baseSalary", "branch", "createdAt", "dismissalDate", "hireDate", "hourlyRate", "id", "name", "password", "role", "sortOrder" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
