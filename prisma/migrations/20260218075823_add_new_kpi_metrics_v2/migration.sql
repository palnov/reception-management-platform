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
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "updatedBy" TEXT,
    CONSTRAINT "MonthlyChecklist_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MonthlyChecklist" ("createdAt", "employeeId", "id", "month", "percentage", "updatedAt", "updatedBy") SELECT "createdAt", "employeeId", "id", "month", "percentage", "updatedAt", "updatedBy" FROM "MonthlyChecklist";
DROP TABLE "MonthlyChecklist";
ALTER TABLE "new_MonthlyChecklist" RENAME TO "MonthlyChecklist";
CREATE UNIQUE INDEX "MonthlyChecklist_month_employeeId_key" ON "MonthlyChecklist"("month", "employeeId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
