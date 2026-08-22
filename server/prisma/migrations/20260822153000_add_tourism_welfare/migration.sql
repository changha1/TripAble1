-- CreateTable
CREATE TABLE "UserBenefit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER,
    "expiresAt" TEXT,
    "priority" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBenefit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TripPlanBenefit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripPlanId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "usedAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingAmount" INTEGER,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TripPlanBenefit_tripPlanId_fkey" FOREIGN KEY ("tripPlanId") REFERENCES "TripPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add benefit totals to TripPlan while preserving existing rows.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TripPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "travelDate" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "totalVoucherAmount" INTEGER NOT NULL,
    "totalDiscountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalVoucherCovered" INTEGER NOT NULL DEFAULT 0,
    "totalSelfPay" INTEGER NOT NULL,
    "remainingBalance" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TripPlan" ("createdAt", "duration", "id", "remainingBalance", "title", "totalSelfPay", "totalVoucherAmount", "travelDate", "userId") SELECT "createdAt", "duration", "id", "remainingBalance", "title", "totalSelfPay", "totalVoucherAmount", "travelDate", "userId" FROM "TripPlan";
DROP TABLE "TripPlan";
ALTER TABLE "new_TripPlan" RENAME TO "TripPlan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserBenefit_userId_benefitId_key" ON "UserBenefit"("userId", "benefitId");
