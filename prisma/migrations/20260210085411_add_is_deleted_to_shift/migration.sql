-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "details" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthlyNorm" (
    "month" TEXT NOT NULL PRIMARY KEY,
    "hours" REAL NOT NULL DEFAULT 176,
    "createdAt" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_MonthlyNorm" ("createdAt", "hours", "month") SELECT "createdAt", "hours", "month" FROM "MonthlyNorm";
DROP TABLE "MonthlyNorm";
ALTER TABLE "new_MonthlyNorm" RENAME TO "MonthlyNorm";
CREATE TABLE "new_KpiRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "qualityScore" REAL NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "salesBonus" REAL NOT NULL DEFAULT 0,
    "checkList" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "KpiRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KpiRecord" ("checkList", "createdAt", "date", "employeeId", "errorsCount", "id", "qualityScore", "salesBonus") SELECT "checkList", "createdAt", "date", "employeeId", "errorsCount", "id", "qualityScore", "salesBonus" FROM "KpiRecord";
DROP TABLE "KpiRecord";
ALTER TABLE "new_KpiRecord" RENAME TO "KpiRecord";
CREATE TABLE "new_PromotionSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "patientId" TEXT,
    "employeeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "bonus" REAL NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "PromotionSale_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PromotionSale" ("bonus", "createdAt", "date", "employeeId", "id", "patientId", "price", "productName") SELECT "bonus", "createdAt", "date", "employeeId", "id", "patientId", "price", "productName" FROM "PromotionSale";
DROP TABLE "PromotionSale";
ALTER TABLE "new_PromotionSale" RENAME TO "PromotionSale";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "password" TEXT NOT NULL DEFAULT '1234',
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "branch" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Employee" ("baseSalary", "branch", "createdAt", "hourlyRate", "id", "name", "role", "sortOrder") SELECT "baseSalary", "branch", "createdAt", "hourlyRate", "id", "name", "role", "sortOrder" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_RegistrationKpi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "patientId" TEXT,
    "employeeId" TEXT NOT NULL,
    "criterion1" REAL NOT NULL DEFAULT 0,
    "criterion2" REAL NOT NULL DEFAULT 0,
    "criterion3" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "maxScore" REAL NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "RegistrationKpi_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RegistrationKpi" ("createdAt", "criterion1", "criterion2", "criterion3", "date", "employeeId", "id", "maxScore", "patientId", "totalScore") SELECT "createdAt", "criterion1", "criterion2", "criterion3", "date", "employeeId", "id", "maxScore", "patientId", "totalScore" FROM "RegistrationKpi";
DROP TABLE "RegistrationKpi";
ALTER TABLE "new_RegistrationKpi" RENAME TO "RegistrationKpi";
CREATE TABLE "new_Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "hours" REAL NOT NULL DEFAULT 0,
    "cabinetClosed" BOOLEAN NOT NULL DEFAULT false,
    "coefficient" REAL NOT NULL DEFAULT 1.0,
    "comment" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("cabinetClosed", "coefficient", "comment", "createdAt", "date", "employeeId", "hours", "id", "type") SELECT "cabinetClosed", "coefficient", "comment", "createdAt", "date", "employeeId", "hours", "id", "type" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
