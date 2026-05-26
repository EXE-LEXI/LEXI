CREATE TYPE "DailyChallengeType" AS ENUM ('COMPLETE_LESSONS');

CREATE TABLE "daily_challenges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "DailyChallengeType" NOT NULL,
    "target" INTEGER NOT NULL,
    "rewardXp" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyChallengeId" TEXT NOT NULL,
    "challengeDate" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_challenges_code_key" ON "daily_challenges"("code");
CREATE UNIQUE INDEX "user_challenges_userId_dailyChallengeId_challengeDate_key" ON "user_challenges"("userId", "dailyChallengeId", "challengeDate");
CREATE INDEX "user_challenges_userId_idx" ON "user_challenges"("userId");
CREATE INDEX "user_challenges_dailyChallengeId_idx" ON "user_challenges"("dailyChallengeId");
CREATE INDEX "user_challenges_challengeDate_idx" ON "user_challenges"("challengeDate");

ALTER TABLE "user_challenges"
ADD CONSTRAINT "user_challenges_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_challenges"
ADD CONSTRAINT "user_challenges_dailyChallengeId_fkey"
FOREIGN KEY ("dailyChallengeId") REFERENCES "daily_challenges"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
