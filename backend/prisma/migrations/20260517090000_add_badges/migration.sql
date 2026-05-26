CREATE TYPE "BadgeCriteriaType" AS ENUM (
    'FIRST_LESSON',
    'THREE_LESSONS',
    'PERFECT_SCORE',
    'FIVE_ATTEMPTS',
    'SEVEN_DAY_STREAK'
);

CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "criteriaType" "BadgeCriteriaType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_badges"
ADD CONSTRAINT "user_badges_badgeId_fkey"
FOREIGN KEY ("badgeId") REFERENCES "badges"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
