-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "baseSalary" REAL NOT NULL DEFAULT 0,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "branch" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "hours" REAL NOT NULL DEFAULT 0,
    "cabinetClosed" BOOLEAN NOT NULL DEFAULT false,
    "coefficient" REAL NOT NULL DEFAULT 1.0,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KpiRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "employeeId" TEXT NOT NULL,
    "qualityScore" REAL NOT NULL DEFAULT 0,
    "errorsCount" INTEGER NOT NULL DEFAULT 0,
    "salesBonus" REAL NOT NULL DEFAULT 0,
    "checkList" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KpiRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyNorm" (
    "month" TEXT NOT NULL PRIMARY KEY,
    "hours" REAL NOT NULL DEFAULT 176,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PromotionSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "patientId" TEXT,
    "employeeId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "bonus" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromotionSale_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistrationKpi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "patientId" TEXT,
    "employeeId" TEXT NOT NULL,
    "criterion1" REAL NOT NULL DEFAULT 0,
    "criterion2" REAL NOT NULL DEFAULT 0,
    "criterion3" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "maxScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistrationKpi_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
