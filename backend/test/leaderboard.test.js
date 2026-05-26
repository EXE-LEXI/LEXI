const assert = require("node:assert/strict");
const test = require("node:test");
const {
  LeaderboardService,
} = require("../dist/src/modules/leaderboard/services/leaderboard.service");

test("weekly leaderboard ranks valid attempt improvement and claimed challenge XP", async () => {
  const service = new LeaderboardService({
    findWeeklyAttempts: async (startAt, endAt) => {
      assert.equal(startAt.getFullYear(), 2026);
      assert.equal(startAt.getMonth(), 4);
      assert.equal(startAt.getDate(), 18);
      assert.equal(endAt.getFullYear(), 2026);
      assert.equal(endAt.getMonth(), 4);
      assert.equal(endAt.getDate(), 25);
      return [
        makeAttempt("user-1", "lesson-1", 70, "Alice"),
        makeAttempt("user-1", "lesson-1", 90, "Alice"),
        makeAttempt("user-2", "lesson-1", 80, "Bob"),
        makeAttempt("user-2", "lesson-2", 50, "Bob"),
      ];
    },
    findPreviousAttemptsBefore: async (_startAt, userIds, lessonIds) => {
      assert.deepEqual(userIds.sort(), ["user-1", "user-2"]);
      assert.deepEqual(lessonIds.sort(), ["lesson-1", "lesson-2"]);
      return [
        {
          userId: "user-1",
          lessonId: "lesson-1",
          score: 60,
        },
        {
          userId: "user-2",
          lessonId: "lesson-1",
          score: 80,
        },
      ];
    },
    findClaimedChallengeRewards: async () => [makeReward("user-2", 20, "Bob")],
    findUserSummary: async () => makeUser("user-1", "Alice"),
  });

  const result = await service.getWeeklyLeaderboard(
    "user-1",
    new Date("2026-05-18T12:00:00.000Z")
  );

  assert.equal(result.items.length, 2);
  assert.deepEqual(
    result.items.map((item) => [item.id, item.xp, item.rank]),
    [
      ["user-2", 70, 1],
      ["user-1", 30, 2],
    ]
  );
  assert.equal(result.currentUser.id, "user-1");
  assert.equal(result.currentUser.rank, 2);
  assert.equal(result.currentUser.xp, 30);
});

test("weekly leaderboard returns current user with zero XP when unranked", async () => {
  const service = new LeaderboardService({
    findWeeklyAttempts: async () => [],
    findPreviousAttemptsBefore: async () => [],
    findClaimedChallengeRewards: async () => [],
    findUserSummary: async () => makeUser("user-3", "Chi"),
  });

  const result = await service.getWeeklyLeaderboard(
    "user-3",
    new Date("2026-05-18T12:00:00.000Z")
  );

  assert.equal(result.items.length, 0);
  assert.equal(result.currentUser.id, "user-3");
  assert.equal(result.currentUser.fullName, "Chi");
  assert.equal(result.currentUser.xp, 0);
  assert.equal(result.currentUser.rank, null);
});

test("weekly leaderboard uses deterministic tie-break after XP", async () => {
  const service = new LeaderboardService({
    findWeeklyAttempts: async () => [
      makeAttempt("user-2", "lesson-1", 50, "Binh"),
      makeAttempt("user-1", "lesson-1", 50, "An"),
    ],
    findPreviousAttemptsBefore: async () => [],
    findClaimedChallengeRewards: async () => [],
    findUserSummary: async () => makeUser("user-1", "An"),
  });

  const result = await service.getWeeklyLeaderboard(
    "user-1",
    new Date("2026-05-18T12:00:00.000Z")
  );

  assert.deepEqual(
    result.items.map((item) => item.fullName),
    ["An", "Binh"]
  );
});

function makeAttempt(userId, lessonId, score, fullName) {
  return {
    userId,
    lessonId,
    score,
    user: makeUser(userId, fullName),
  };
}

function makeReward(userId, rewardXp, fullName) {
  return {
    userId,
    dailyChallenge: {
      rewardXp,
    },
    user: makeUser(userId, fullName),
  };
}

function makeUser(id, fullName) {
  return {
    id,
    email: `${id}@lexi.vn`,
    profile: {
      fullName,
      avatarUrl: null,
    },
  };
}
