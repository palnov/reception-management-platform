/*
  Warnings:

  - You are about to alter the column `checkList` on the `KpiRecord` table. The data in that column could be lost. The data in that column will be cast from `Boolean` to `Float`.

*/
-- CreateTable
CREATE TABLE "MonthlyChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "percentage" REAL NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "updatedBy" TEXT,
    CONSTRAINT "MonthlyChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "RegistrationKpi_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RegistrationKpi" ("createdAt", "createdBy", "criterion1", "criterion2", "criterion3", "date", "employeeId", "id", "maxScore", "patientId", "totalScore") SELECT "createdAt", "createdBy", "criterion1", "criterion2", "criterion3", "date", "employeeId", "id", "maxScore", "patientId", "totalScore" FROM "RegistrationKpi";
DROP TABLE "RegistrationKpi";
ALTER TABLE "new_RegistrationKpi" RENAME TO "RegistrationKpi";
CREATE TABLE "new_KpiRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "qualityScore" REAL NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "salesBonus" REAL NOT NULL DEFAULT 0,
    "checkList" REAL NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    CONSTRAINT "KpiRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KpiRecord" ("checkList", "createdAt", "createdBy", "date", "employeeId", "errorsCount", "id", "qualityScore", "salesBonus") SELECT "checkList", "createdAt", "createdBy", "date", "employeeId", "errorsCount", "id", "qualityScore", "salesBonus" FROM "KpiRecord";
DROP TABLE "KpiRecord";
ALTER TABLE "new_KpiRecord" RENAME TO "KpiRecord";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyChecklist_month_employeeId_key" ON "MonthlyChecklist"("month", "employeeId");
