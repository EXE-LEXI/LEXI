const assert = require("node:assert/strict");
const test = require("node:test");
const { BadRequestException, ConflictException } = require("@nestjs/common");
const { DailyChallengeType } = require("@prisma/client");
const {
  DailyChallengesRepository,
} = require("../dist/src/modules/gamification/repositories/daily-challenges.repository");
const {
  DailyChallengesService,
} = require("../dist/src/modules/gamification/services/daily-challenges.service");

test("daily challenges returns progress for today's distinct completed lessons", async () => {
  const calls = [];
  const stateCalls = [];
  const service = new DailyChallengesService({
    findActiveDailyChallenges: async () => [makeDailyChallenge()],
    countDistinctCompletedLessonsForDay: async (
      userId,
      startOfDay,
      startOfNextDay
    ) => {
      calls.push({ userId, startOfDay, startOfNextDay });
      return 2;
    },
    calculateProgressForChallenge: ({ completedLessons }) => completedLessons,
    upsertUserChallengeState: async (args) => {
      stateCalls.push(args);
      return {
        id: "user-challenge-1",
        progress: args.progress,
        isCompleted: args.isCompleted,
        completedAt: args.isCompleted ? args.now : null,
        claimedAt: null,
      };
    },
  });

  const result = await service.getDailyChallenges(
    "user-1",
    new Date("2026-05-17T10:30:00.000Z")
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].userId, "user-1");
  assert.equal(calls[0].startOfDay.getHours(), 0);
  assert.equal(calls[0].startOfNextDay.getDate(), 18);
  assert.equal(stateCalls.length, 1);
  assert.equal(stateCalls[0].progress, 2);
  assert.equal(stateCalls[0].isCompleted, false);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].type, "COMPLETE_LESSONS");
  assert.equal(result.items[0].date, "2026-05-17");
  assert.equal(result.items[0].target, 3);
  assert.equal(result.items[0].progress, 2);
  assert.equal(result.items[0].progressRate, 67);
  assert.equal(result.items[0].isCompleted, false);
  assert.equal(result.items[0].isClaimed, false);
});

test("daily challenges caps progress once target is completed", async () => {
  const service = new DailyChallengesService({
    findActiveDailyChallenges: async () => [makeDailyChallenge()],
    countDistinctCompletedLessonsForDay: async () => 5,
    calculateProgressForChallenge: ({ completedLessons }) => completedLessons,
    upsertUserChallengeState: async (args) => ({
      id: "user-challenge-1",
      progress: args.progress,
      isCompleted: args.isCompleted,
      completedAt: args.now,
      claimedAt: null,
    }),
  });

  const result = await service.getDailyChallenges(
    "user-1",
    new Date("2026-05-17T10:30:00.000Z")
  );

  assert.equal(result.items[0].progress, 3);
  assert.equal(result.items[0].progressRate, 100);
  assert.equal(result.items[0].isCompleted, true);
});

test("daily challenge claim awards XP once completed", async () => {
  const calls = [];
  const service = new DailyChallengesService({
    findActiveDailyChallengeById: async (challengeId) => {
      assert.equal(challengeId, "challenge-1");
      return makeDailyChallenge();
    },
    countDistinctCompletedLessonsForDay: async () => 3,
    calculateProgressForChallenge: ({ completedLessons }) => completedLessons,
    claimDailyChallenge: async (args) => {
      calls.push(args);
      return {
        wasClaimed: true,
        userChallenge: {
          id: "user-challenge-1",
          progress: args.progress,
          isCompleted: true,
          completedAt: args.now,
          claimedAt: args.now,
        },
      };
    },
  });

  const result = await service.claimDailyChallenge(
    "user-1",
    "challenge-1",
    new Date("2026-05-17T10:30:00.000Z")
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].rewardXp, 20);
  assert.equal(result.xpAwarded, 20);
  assert.equal(result.challenge.isClaimed, true);
});

test("daily challenge claim rejects incomplete challenges", async () => {
  const service = new DailyChallengesService({
    findActiveDailyChallengeById: async () => makeDailyChallenge(),
    countDistinctCompletedLessonsForDay: async () => 2,
    calculateProgressForChallenge: ({ completedLessons }) => completedLessons,
  });

  await assert.rejects(
    () =>
      service.claimDailyChallenge(
        "user-1",
        "challenge-1",
        new Date("2026-05-17T10:30:00.000Z")
      ),
    BadRequestException
  );
});

test("daily challenge claim rejects duplicate claims", async () => {
  const service = new DailyChallengesService({
    findActiveDailyChallengeById: async () => makeDailyChallenge(),
    countDistinctCompletedLessonsForDay: async () => 3,
    calculateProgressForChallenge: ({ completedLessons }) => completedLessons,
    claimDailyChallenge: async () => ({
      wasClaimed: false,
      userChallenge: {
        id: "user-challenge-1",
        progress: 3,
        isCompleted: true,
        completedAt: new Date("2026-05-17T10:00:00.000Z"),
        claimedAt: new Date("2026-05-17T10:00:00.000Z"),
      },
    }),
  });

  await assert.rejects(
    () =>
      service.claimDailyChallenge(
        "user-1",
        "challenge-1",
        new Date("2026-05-17T10:30:00.000Z")
      ),
    ConflictException
  );
});

test("daily challenge repository counts unique completed lesson attempts in the day", async () => {
  const calls = [];
  const prisma = {
    lessonAttempt: {
      groupBy: async (args) => {
        calls.push(args);
        return [{ lessonId: "lesson-1" }, { lessonId: "lesson-2" }];
      },
    },
  };

  const repository = new DailyChallengesRepository(prisma);
  const startOfDay = new Date("2026-05-17T00:00:00.000Z");
  const startOfNextDay = new Date("2026-05-18T00:00:00.000Z");

  const result = await repository.countDistinctCompletedLessonsForDay(
    "user-1",
    startOfDay,
    startOfNextDay
  );

  assert.equal(result, 2);
  assert.deepEqual(calls[0].by, ["lessonId"]);
  assert.equal(calls[0].where.userId, "user-1");
  assert.deepEqual(calls[0].where.finishedAt, {
    gte: startOfDay,
    lt: startOfNextDay,
  });
});

function makeDailyChallenge() {
  return {
    id: "challenge-1",
    code: "complete_lessons_daily",
    title: "Hoàn thành bài học hôm nay",
    description: "Hoàn thành 3 bài học khác nhau để giữ nhịp học mỗi ngày.",
    type: DailyChallengeType.COMPLETE_LESSONS,
    target: 3,
    rewardXp: 20,
  };
}
