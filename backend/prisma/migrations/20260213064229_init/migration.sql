-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "daoName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Bazi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER NOT NULL,
    "birthHour" INTEGER NOT NULL,
    "birthMinute" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Shanghai',
    "yearStem" TEXT NOT NULL,
    "yearBranch" TEXT NOT NULL,
    "yearElement" TEXT NOT NULL,
    "monthStem" TEXT NOT NULL,
    "monthBranch" TEXT NOT NULL,
    "monthElement" TEXT NOT NULL,
    "dayStem" TEXT NOT NULL,
    "dayBranch" TEXT NOT NULL,
    "dayElement" TEXT NOT NULL,
    "hourStem" TEXT NOT NULL,
    "hourBranch" TEXT NOT NULL,
    "hourElement" TEXT NOT NULL,
    "metalCount" INTEGER NOT NULL DEFAULT 0,
    "woodCount" INTEGER NOT NULL DEFAULT 0,
    "waterCount" INTEGER NOT NULL DEFAULT 0,
    "fireCount" INTEGER NOT NULL DEFAULT 0,
    "earthCount" INTEGER NOT NULL DEFAULT 0,
    "rootType" TEXT NOT NULL,
    "rootName" TEXT NOT NULL,
    "primaryElement" TEXT NOT NULL,
    "secondaryElement" TEXT,
    "variantType" TEXT,
    "rootBonus" REAL NOT NULL,
    "rootDescription" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bazi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cultivation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentExp" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,
    "realm" INTEGER NOT NULL DEFAULT 1,
    "realmName" TEXT NOT NULL DEFAULT '炼气',
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "todayMinutes" INTEGER NOT NULL DEFAULT 0,
    "isCultivating" BOOLEAN NOT NULL DEFAULT false,
    "cultivateStartAt" DATETIME,
    "lastCultivateAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cultivation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "spiritStones" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "todayMinutes" INTEGER NOT NULL,
    "expGained" INTEGER NOT NULL,
    "bonusApplied" REAL NOT NULL,
    "greeting" TEXT NOT NULL,
    "cultivationReview" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "wisdom" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "goldenQuote" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_daoName_key" ON "User"("daoName");

-- CreateIndex
CREATE UNIQUE INDEX "Bazi_userId_key" ON "Bazi"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cultivation_userId_key" ON "Cultivation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resources_userId_key" ON "Resources"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_userId_date_key" ON "DailySummary"("userId", "date");
