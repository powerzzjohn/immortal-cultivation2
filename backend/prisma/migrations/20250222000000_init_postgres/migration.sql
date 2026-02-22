-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "daoName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bazi" (
    "id" TEXT NOT NULL,
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
    "rootBonus" DOUBLE PRECISION NOT NULL,
    "rootDescription" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bazi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultivation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentExp" INTEGER NOT NULL DEFAULT 0,
    "totalExp" INTEGER NOT NULL DEFAULT 0,
    "realm" INTEGER NOT NULL DEFAULT 1,
    "realmName" TEXT NOT NULL DEFAULT '炼气',
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "todayMinutes" INTEGER NOT NULL DEFAULT 0,
    "isCultivating" BOOLEAN NOT NULL DEFAULT false,
    "cultivateStartAt" TIMESTAMP(3),
    "lastCultivateAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cultivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resources" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spiritStones" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "todayMinutes" INTEGER NOT NULL,
    "expGained" INTEGER NOT NULL,
    "bonusApplied" DOUBLE PRECISION NOT NULL,
    "greeting" TEXT NOT NULL,
    "cultivationReview" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "wisdom" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "goldenQuote" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyWisdom" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quoteId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyWisdom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WisdomInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WisdomInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CultivationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "expGained" INTEGER NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CultivationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceLog_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "DailyWisdom_userId_date_key" ON "DailyWisdom"("userId", "date");

-- AddForeignKey
ALTER TABLE "Bazi" ADD CONSTRAINT "Bazi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivation" ADD CONSTRAINT "Cultivation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resources" ADD CONSTRAINT "Resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
