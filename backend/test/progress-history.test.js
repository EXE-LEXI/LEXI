const assert = require("node:assert/strict");
const test = require("node:test");
const { NotFoundException } = require("@nestjs/common");
const {
  ProgressRepository,
} = require("../dist/src/modules/learning/progress/repositories/progress.repository");
const {
  ProgressService,
} = require("../dist/src/modules/learning/progress/services/progress.service");
const { ProgressStatus } = require("@prisma/client");

test("current lesson returns the latest in-progress lesson first", async () => {
  const service = new ProgressService({
    findCurrentInProgressLesson: async () => ({
      status: ProgressStatus.IN_PROGRESS,
      lastScore: 20,
      completedAt: null,
      lesson: createLessonRecord("lesson-in-progress"),
    }),
    findFirstIncompleteLesson: async () => {
      throw new Error("should not query fallback lesson");
    },
  });

  const result = await service.getUserCurrentLesson("user-1");

  assert.equal(result.currentLesson.id, "lesson-in-progress");
  assert.equal(result.progress.status, ProgressStatus.IN_PROGRESS);
  assert.equal(result.progress.lastScore, 20);
  assert.equal(result.isCourseCompleted, false);
});

test("current lesson falls back to the first incomplete lesson", async () => {
  const service = new ProgressService({
    findCurrentInProgressLesson: async () => null,
    findFirstIncompleteLesson: async () => ({
      ...createLessonRecord("lesson-next"),
      progress: [],
    }),
  });

  const result = await service.getUserCurrentLesson("user-1");

  assert.equal(result.currentLesson.id, "lesson-next");
  assert.equal(result.progress.status, ProgressStatus.NOT_STARTED);
  assert.equal(result.progress.lastScore, null);
  assert.equal(result.isCourseCompleted, false);
});

test("current lesson reports completed course when no incomplete lesson exists", async () => {
  const service = new ProgressService({
    findCurrentInProgressLesson: async () => null,
    findFirstIncompleteLesson: async () => null,
  });

  const result = await service.getUserCurrentLesson("user-1");

  assert.equal(result.currentLesson, null);
  assert.equal(result.progress, null);
  assert.equal(result.isCourseCompleted, true);
});

test("learning history returns completed attempts for the current user", async () => {
  const calls = [];
  const prisma = {
    $transaction: async (operations) => Promise.all(operations),
    lessonAttempt: {
      count: async (args) => {
        calls.push({ ...args, operation: "count" });
        return 1;
      },
      findMany: async (args) => {
        calls.push({ ...args, operation: "findMany" });
        return [
          {
            id: "attempt-1",
            lessonId: "lesson-1",
            score: 70,
            correctAnswers: 7,
            totalQuestions: 10,
            startedAt: new Date("2026-05-11T08:50:00.000Z"),
            finishedAt: new Date("2026-05-11T09:00:00.000Z"),
            lesson: {
              id: "lesson-1",
              title: "Lesson title",
              module: {
                id: "module-1",
                title: "Module title",
                category: {
                  id: "category-1",
                  title: "Category title",
                },
              },
            },
          },
        ];
      },
    },
  };

  const service = new ProgressService(new ProgressRepository(prisma));

  const result = await service.getUserLearningHistory("user-1", 1, 10);

  assert.equal(calls.length, 2);
  assert.equal(calls[1].where.userId, "user-1");
  assert.deepEqual(calls[1].where.finishedAt, { not: null });
  assert.equal(calls[1].skip, 0);
  assert.equal(calls[1].take, 10);
  assert.equal(result.meta.total, 1);
  assert.equal(result.meta.page, 1);
  assert.equal(result.meta.limit, 10);
  assert.equal(result.meta.hasNextPage, false);
  assert.equal(result.items[0].lessonTitle, "Lesson title");
  assert.equal(result.items[0].wrongAnswers, 3);
  assert.equal(result.items[0].module.id, "module-1");
  assert.equal(result.items[0].category.id, "category-1");
});

test("attempt detail returns ordered answers and explanations", async () => {
  const calls = [];
  const prisma = {
    lessonAttempt: {
      findFirst: async (args) => {
        calls.push(args);
        return {
          id: "attempt-1",
          lessonId: "lesson-1",
          score: 50,
          correctAnswers: 1,
          totalQuestions: 2,
          startedAt: new Date("2026-05-11T08:50:00.000Z"),
          finishedAt: new Date("2026-05-11T09:00:00.000Z"),
          lesson: {
            id: "lesson-1",
            title: "Lesson title",
            module: {
              id: "module-1",
              title: "Module title",
              category: {
                id: "category-1",
                title: "Category title",
              },
            },
          },
          answers: [
            {
              id: "answer-2",
              questionId: "question-2",
              selectedOption: {
                id: "option-2-b",
                optionText: "Wrong option",
              },
              isCorrect: false,
              question: {
                id: "question-2",
                questionText: "Second question",
                explanation: "Second explanation",
                sortOrder: 2,
                options: [{ id: "option-2-a", optionText: "Correct option" }],
              },
            },
            {
              id: "answer-1",
              questionId: "question-1",
              selectedOption: {
                id: "option-1-a",
                optionText: "Correct first option",
              },
              isCorrect: true,
              question: {
                id: "question-1",
                questionText: "First question",
                explanation: "First explanation",
                sortOrder: 1,
                options: [
                  { id: "option-1-a", optionText: "Correct first option" },
                ],
              },
            },
          ],
        };
      },
    },
  };

  const service = new ProgressService(new ProgressRepository(prisma));

  const result = await service.getUserAttemptDetail("user-1", "attempt-1");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].where.id, "attempt-1");
  assert.equal(calls[0].where.userId, "user-1");
  assert.equal(result.lesson.id, "lesson-1");
  assert.equal(result.wrongAnswers, 1);
  assert.deepEqual(
    result.answers.map((answer) => answer.questionId),
    ["question-1", "question-2"]
  );
  assert.equal(result.answers[1].selectedOption.text, "Wrong option");
  assert.equal(result.answers[1].correctOption.text, "Correct option");
  assert.equal(result.answers[1].explanation, "Second explanation");
});

test("attempt detail rejects missing or unauthorized attempts", async () => {
  const prisma = {
    lessonAttempt: {
      findFirst: async () => null,
    },
  };

  const service = new ProgressService(new ProgressRepository(prisma));

  await assert.rejects(
    () => service.getUserAttemptDetail("user-1", "attempt-from-other-user"),
    NotFoundException
  );
});

function createLessonRecord(id) {
  return {
    id,
    slug: `${id}-slug`,
    title: "Lesson title",
    module: {
      id: "module-1",
      title: "Module title",
      category: {
        id: "category-1",
        title: "Category title",
      },
    },
  };
}
