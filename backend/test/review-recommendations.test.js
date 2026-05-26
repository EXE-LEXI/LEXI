const assert = require("node:assert/strict");
const test = require("node:test");
const { LessonReviewStatus, ProgressStatus } = require("@prisma/client");
const {
  ReviewRecommendationsRepository,
} = require("../dist/src/modules/learning/review/repositories/review-recommendations.repository");
const {
  ReviewRecommendationsService,
} = require("../dist/src/modules/learning/review/services/review-recommendations.service");

test("review recommendations prioritize mistakes, dedupe lessons, then low score and in-progress", async () => {
  const service = new ReviewRecommendationsService({
    findRecentMistakes: async () => [
      makeMistake({
        lessonId: "lesson-1",
        questionId: "question-1",
        createdAt: new Date("2026-05-18T10:00:00.000Z"),
        score: 55,
      }),
    ],
    findLowScoreAttempts: async () => [
      makeLowScore({
        lessonId: "lesson-1",
        score: 30,
        finishedAt: new Date("2026-05-18T11:00:00.000Z"),
      }),
      makeLowScore({
        lessonId: "lesson-2",
        score: 40,
        finishedAt: new Date("2026-05-18T09:00:00.000Z"),
      }),
    ],
    findInProgressLessons: async () => [
      makeInProgress({
        lessonId: "lesson-3",
        updatedAt: new Date("2026-05-18T08:00:00.000Z"),
      }),
    ],
  });

  const result = await service.getRecommendations("user-1", 5);

  assert.deepEqual(
    result.items.map((item) => [item.lesson.id, item.reasonCode]),
    [
      ["lesson-1", "RECENT_MISTAKE"],
      ["lesson-2", "LOW_SCORE"],
      ["lesson-3", "IN_PROGRESS"],
    ]
  );
  assert.equal(result.items[0].questionId, "question-1");
  assert.equal(result.items[1].score, 40);
});

test("review recommendations return empty state when no signals exist", async () => {
  const service = new ReviewRecommendationsService({
    findRecentMistakes: async () => [],
    findLowScoreAttempts: async () => [],
    findInProgressLessons: async () => [],
  });

  const result = await service.getRecommendations("user-1");

  assert.deepEqual(result.items, []);
});

test("review recommendations repository filters active content and current user", async () => {
  const calls = [];
  const prisma = {
    userAnswer: {
      findMany: async (args) => {
        calls.push(["mistakes", args]);
        return [];
      },
    },
    lessonAttempt: {
      findMany: async (args) => {
        calls.push(["lowScore", args]);
        return [];
      },
    },
    userProgress: {
      findMany: async (args) => {
        calls.push(["inProgress", args]);
        return [];
      },
    },
  };
  const repository = new ReviewRecommendationsRepository(prisma);

  await repository.findRecentMistakes("user-1", 20);
  await repository.findLowScoreAttempts("user-1", 20, 80);
  await repository.findInProgressLessons("user-1", 20);

  assert.equal(calls[0][1].where.attempt.userId, "user-1");
  assert.equal(calls[0][1].where.question.lesson.isActive, true);
  assert.equal(
    calls[0][1].where.question.lesson.reviewStatus,
    LessonReviewStatus.PUBLISHED
  );
  assert.equal(calls[1][1].where.userId, "user-1");
  assert.deepEqual(calls[1][1].where.score, { lt: 80 });
  assert.equal(calls[2][1].where.userId, "user-1");
  assert.equal(calls[2][1].where.status, ProgressStatus.IN_PROGRESS);
});

function makeLesson(overrides = {}) {
  return {
    id: overrides.lessonId ?? "lesson-1",
    title: overrides.lessonTitle ?? `Lesson ${overrides.lessonId ?? "1"}`,
    module: {
      id: overrides.moduleId ?? "module-1",
      title: overrides.moduleTitle ?? "Module title",
      category: {
        id: overrides.categoryId ?? "category-1",
        title: overrides.categoryTitle ?? "Category title",
      },
    },
  };
}

function makeMistake(overrides = {}) {
  return {
    questionId: overrides.questionId ?? "question-1",
    createdAt: overrides.createdAt ?? new Date("2026-05-18T10:00:00.000Z"),
    attempt: {
      score: overrides.score ?? 50,
      finishedAt: overrides.finishedAt ?? new Date("2026-05-18T10:05:00.000Z"),
    },
    question: {
      lesson: makeLesson(overrides),
    },
  };
}

function makeLowScore(overrides = {}) {
  return {
    lessonId: overrides.lessonId ?? "lesson-1",
    score: overrides.score ?? 50,
    finishedAt: overrides.finishedAt ?? new Date("2026-05-18T10:05:00.000Z"),
    lesson: makeLesson(overrides),
  };
}

function makeInProgress(overrides = {}) {
  return {
    lessonId: overrides.lessonId ?? "lesson-1",
    lastScore: overrides.lastScore ?? null,
    updatedAt: overrides.updatedAt ?? new Date("2026-05-18T10:10:00.000Z"),
    lesson: makeLesson(overrides),
  };
}
