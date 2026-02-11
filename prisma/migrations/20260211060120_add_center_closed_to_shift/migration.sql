-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "hours" REAL NOT NULL DEFAULT 0,
    "cabinetClosed" BOOLEAN NOT NULL DEFAULT false,
    "centerClosed" BOOLEAN NOT NULL DEFAULT false,
    "coefficient" REAL NOT NULL DEFAULT 1.0,
    "comment" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("cabinetClosed", "coefficient", "comment", "createdAt", "createdBy", "date", "employeeId", "hours", "id", "isDeleted", "type") SELECT "cabinetClosed", "coefficient", "comment", "createdAt", "createdBy", "date", "employeeId", "hours", "id", "isDeleted", "type" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
