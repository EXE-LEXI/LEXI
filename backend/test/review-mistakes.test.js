const assert = require("node:assert/strict");
const test = require("node:test");
const {
  ReviewMistakesRepository,
} = require("../dist/src/modules/learning/review/repositories/review-mistakes.repository");
const {
  ReviewMistakesService,
} = require("../dist/src/modules/learning/review/services/review-mistakes.service");

function makeWrongAnswer(overrides = {}) {
  const questionId = overrides.questionId ?? "question-1";

  return {
    id: overrides.id ?? `answer-${questionId}`,
    attemptId: overrides.attemptId ?? `attempt-${questionId}`,
    questionId,
    selectedOptionId: overrides.selectedOptionId ?? `selected-${questionId}`,
    isCorrect: false,
    createdAt: overrides.createdAt ?? new Date("2026-05-11T09:00:00.000Z"),
    selectedOption: {
      id: overrides.selectedOptionId ?? `selected-${questionId}`,
      optionText: overrides.selectedOptionText ?? "Wrong answer",
    },
    attempt: {
      id: overrides.attemptId ?? `attempt-${questionId}`,
      score: overrides.score ?? 50,
      finishedAt: overrides.finishedAt ?? new Date("2026-05-11T09:05:00.000Z"),
    },
    question: {
      id: questionId,
      questionText: overrides.questionText ?? "What should the learner do?",
      explanation: overrides.explanation ?? "Because this is the legal rule.",
      options: [
        {
          id: overrides.correctOptionId ?? `correct-${questionId}`,
          optionText: overrides.correctOptionText ?? "Correct answer",
        },
      ],
      lesson: {
        id: overrides.lessonId ?? "lesson-1",
        title: overrides.lessonTitle ?? "Lesson title",
        module: {
          id: overrides.moduleId ?? "module-1",
          title: overrides.moduleTitle ?? "Module title",
          category: {
            id: overrides.categoryId ?? "category-1",
            title: overrides.categoryTitle ?? "Category title",
          },
        },
      },
    },
  };
}

test("review mistakes returns latest unique wrong questions for the user", async () => {
  const calls = [];
  const firstPage = Array.from({ length: 25 }, (_, index) =>
    makeWrongAnswer({
      id: `answer-q1-${index}`,
      questionId: "question-1",
      selectedOptionText: "Repeated wrong answer",
      createdAt: new Date(
        `2026-05-11T09:${String(index).padStart(2, "0")}:00.000Z`
      ),
    })
  );
  const secondPage = [
    makeWrongAnswer({
      questionId: "question-2",
      questionText: "Second wrong question",
      selectedOptionText: "Selected B",
      correctOptionText: "Correct C",
      lessonId: "lesson-2",
    }),
  ];

  const prisma = {
    userAnswer: {
      groupBy: async (args) => {
        calls.push({ ...args, operation: "groupBy" });
        return [{ questionId: "question-1" }, { questionId: "question-2" }];
      },
      findMany: async (args) => {
        calls.push({ ...args, operation: "findMany" });
        const findManyCalls = calls.filter(
          (call) => call.operation === "findMany"
        ).length;
        return findManyCalls === 1 ? firstPage : secondPage;
      },
    },
  };

  const service = new ReviewMistakesService(
    new ReviewMistakesRepository(prisma)
  );

  const result = await service.getLatestMistakes("user-1", 1, 2);

  assert.equal(calls.length, 3);
  assert.equal(calls[0].where.isCorrect, false);
  assert.equal(calls[0].where.attempt.userId, "user-1");
  assert.equal(calls[0].take, 25);
  assert.equal(calls[1].skip, 25);
  assert.equal(result.meta.total, 2);
  assert.equal(result.meta.page, 1);
  assert.equal(result.meta.limit, 2);
  assert.equal(result.meta.hasNextPage, false);
  assert.deepEqual(
    result.items.map((item) => item.questionId),
    ["question-1", "question-2"]
  );
  assert.equal(result.items[0].selectedOption.text, "Repeated wrong answer");
  assert.equal(result.items[1].correctOption.text, "Correct C");
  assert.equal(result.items[1].lesson.id, "lesson-2");
});
