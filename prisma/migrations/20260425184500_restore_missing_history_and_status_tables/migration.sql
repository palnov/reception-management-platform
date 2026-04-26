-- CreateTable
CREATE TABLE IF NOT EXISTS "EmployeeRoleHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "seniorId" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    CONSTRAINT "EmployeeRoleHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmployeeSalaryHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    CONSTRAINT "EmployeeSalaryHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "criterion1" REAL NOT NULL DEFAULT 0,
    "criterion2" REAL NOT NULL DEFAULT 0,
    "criterion3" REAL NOT NULL DEFAULT 0,
    "criterion4" REAL NOT NULL DEFAULT 0,
    "criterion5" REAL NOT NULL DEFAULT 0,
    "criterion6" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "maxScore" REAL NOT NULL DEFAULT 100,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "DailyChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClosedMonth" (
    "month" TEXT NOT NULL PRIMARY KEY,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeRoleHistory_employeeId_startDate_idx" ON "EmployeeRoleHistory"("employeeId", "startDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeSalaryHistory_employeeId_startDate_idx" ON "EmployeeSalaryHistory"("employeeId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DailyChecklist_employeeId_date_key" ON "DailyChecklist"("employeeId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyChecklist_employeeId_date_idx" ON "DailyChecklist"("employeeId", "date");

-- Backfill current employee state as open-ended history records.
INSERT INTO "EmployeeRoleHistory" ("id", "employeeId", "role", "seniorId", "startDate", "endDate")
SELECT lower(hex(randomblob(16))), "id", "role", "seniorId",
       CASE WHEN "hireDate" IS NOT NULL AND "hireDate" != '' THEN "hireDate" ELSE '2000-01-01' END,
       NULL
FROM "Employee"
WHERE NOT EXISTS (
    SELECT 1 FROM "EmployeeRoleHistory" WHERE "EmployeeRoleHistory"."employeeId" = "Employee"."id"
);

INSERT INTO "EmployeeSalaryHistory" ("id", "employeeId", "baseSalary", "hourlyRate", "startDate", "endDate")
SELECT lower(hex(randomblob(16))), "id", "baseSalary", "hourlyRate",
       CASE
           WHEN "hireDate" IS NOT NULL AND length("hireDate") >= 7 THEN substr("hireDate", 1, 7) || '-01'
           ELSE '2000-01-01'
       END,
       NULL
FROM "Employee"
WHERE NOT EXISTS (
    SELECT 1 FROM "EmployeeSalaryHistory" WHERE "EmployeeSalaryHistory"."employeeId" = "Employee"."id"
);
