const assert = require("node:assert/strict");
const test = require("node:test");
const { BadgeCriteriaType } = require("@prisma/client");
const {
  BadgesMapper,
} = require("../dist/src/modules/gamification/mappers/badges.mapper");
const {
  BadgesService,
} = require("../dist/src/modules/gamification/services/badges.service");

test("badges service returns locked and unlocked badge state", async () => {
  const service = new BadgesService({
    findBadgesForUser: async (userId) => {
      assert.equal(userId, "user-1");
      return [
        {
          id: "badge-1",
          code: "first_lesson",
          title: "First Lesson",
          description: "Complete your first lesson.",
          iconName: "school",
          criteriaType: BadgeCriteriaType.FIRST_LESSON,
          users: [{ unlockedAt: new Date("2026-05-17T09:00:00.000Z") }],
        },
        {
          id: "badge-2",
          code: "seven_day_streak",
          title: "7-Day Streak",
          description: "Learn for 7 active days in a row.",
          iconName: "local_fire_department",
          criteriaType: BadgeCriteriaType.SEVEN_DAY_STREAK,
          users: [],
        },
      ];
    },
  });

  const result = await service.getBadges("user-1");

  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].isUnlocked, true);
  assert.equal(
    result.items[0].unlockedAt.toISOString(),
    "2026-05-17T09:00:00.000Z"
  );
  assert.equal(result.items[1].isUnlocked, false);
  assert.equal(result.items[1].unlockedAt, null);
});

test("badges mapper tolerates missing unlock relation", () => {
  const result = BadgesMapper.toResponse([
    {
      id: "badge-1",
      code: "perfect_score",
      title: "Perfect Score",
      description: "Score 100% on any quiz.",
      iconName: "verified",
      criteriaType: BadgeCriteriaType.PERFECT_SCORE,
    },
  ]);

  assert.equal(result.items[0].isUnlocked, false);
  assert.equal(result.items[0].unlockedAt, null);
});
