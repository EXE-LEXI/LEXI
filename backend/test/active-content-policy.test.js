const assert = require("node:assert/strict");
const test = require("node:test");
const { LessonReviewStatus } = require("@prisma/client");
const {
  LessonsRepository,
} = require("../dist/src/modules/learning/lessons/repositories/lessons.repository");
const {
  ModulesRepository,
} = require("../dist/src/modules/learning/modules/repositories/modules.repository");
const {
  ProgressRepository,
} = require("../dist/src/modules/learning/progress/repositories/progress.repository");

test("modules repository filters out modules under inactive categories", async () => {
  const calls = [];
  const repository = new ModulesRepository({
    $transaction: async (operations) => operations,
    learningModule: {
      count: (args) => {
        calls.push({ operation: "count", ...args });
        return 0;
      },
      findMany: (args) => {
        calls.push({ operation: "findMany", ...args });
        return [];
      },
    },
  });

  await repository.findActiveModules({ page: 1, limit: 20 });

  assert.equal(calls[0].where.isActive, true);
  assert.equal(calls[0].where.lessons, undefined);
  assert.equal(calls[0].where.category.isActive, true);
  assert.equal(calls[1].where.category.isActive, true);
  assert.equal(
    calls[1].include.lessons.where.reviewStatus,
    LessonReviewStatus.PUBLISHED
  );
});

test("lesson submission only loads lessons in an active content tree", async () => {
  let findFirstArgs = null;
  const repository = new LessonsRepository({
    lesson: {
      findFirst: (args) => {
        findFirstArgs = args;
        return null;
      },
    },
  });

  await repository.findActiveLessonForSubmission("lesson-1");

  assert.equal(findFirstArgs.where.id, "lesson-1");
  assert.equal(findFirstArgs.where.isActive, true);
  assert.equal(findFirstArgs.where.reviewStatus, LessonReviewStatus.PUBLISHED);
  assert.equal(findFirstArgs.where.module.isActive, true);
  assert.equal(findFirstArgs.where.module.category.isActive, true);
});

test("progress completion count uses the same active content tree as total lessons", async () => {
  const calls = [];
  const repository = new ProgressRepository({
    $transaction: async (operations) => operations,
    user: {
      findUnique: (args) => {
        calls.push({ operation: "user.findUnique", ...args });
        return null;
      },
    },
    lesson: {
      count: (args) => {
        calls.push({ operation: "lesson.count", ...args });
        return 0;
      },
    },
    userProgress: {
      count: (args) => {
        calls.push({ operation: "userProgress.count", ...args });
        return 0;
      },
    },
    lessonAttempt: {
      count: (args) => {
        calls.push({ operation: "lessonAttempt.count", ...args });
        return 0;
      },
      findMany: (args) => {
        calls.push({ operation: "lessonAttempt.findMany", ...args });
        return [];
      },
    },
  });

  await repository.getProgressSummaryData(
    "user-1",
    new Date("2026-05-13T00:00:00.000Z"),
    new Date("2026-05-14T00:00:00.000Z"),
    30
  );

  const totalLessonsCall = calls.find(
    (call) => call.operation === "lesson.count"
  );
  const completedLessonsCall = calls.find(
    (call) => call.operation === "userProgress.count"
  );

  assert.equal(totalLessonsCall.where.module.category.isActive, true);
  assert.equal(
    totalLessonsCall.where.reviewStatus,
    LessonReviewStatus.PUBLISHED
  );
  assert.equal(
    completedLessonsCall.where.lesson.module.category.isActive,
    true
  );
  assert.equal(
    completedLessonsCall.where.lesson.reviewStatus,
    LessonReviewStatus.PUBLISHED
  );
});
