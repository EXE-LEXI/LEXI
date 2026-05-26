const assert = require("node:assert/strict");
const test = require("node:test");
const {
  LessonsMapper,
} = require("../dist/src/modules/learning/lessons/mappers/lessons.mapper");

test("lesson detail response hides correct option flags", () => {
  const result = LessonsMapper.toLessonDetailResponse({
    id: "lesson-1",
    slug: "lesson-one",
    title: "Lesson one",
    content: "Content",
    videoUrl: null,
    sourceTitle: null,
    sourceUrl: null,
    legalDocumentNo: null,
    effectiveDate: null,
    reviewedAt: null,
    reviewerNote: null,
    module: {
      id: "module-1",
      title: "Module one",
      category: {
        id: "category-1",
        title: "Category one",
      },
    },
    questions: [
      {
        id: "question-1",
        questionText: "Question text",
        sortOrder: 1,
        options: [
          {
            id: "option-1",
            optionText: "Option text",
            sortOrder: 1,
            isCorrect: true,
          },
        ],
      },
    ],
  });

  assert.equal(result.questions[0].text, "Question text");
  assert.equal(result.questions[0].options[0].text, "Option text");
  assert.equal("isCorrect" in result.questions[0].options[0], false);
});

test("quiz submission response includes wrong answer count", () => {
  const result = LessonsMapper.toQuizSubmissionResponse({
    attemptId: "attempt-1",
    score: 50,
    correctCount: 1,
    totalQuestions: 2,
    xpAwarded: 20,
    bestScore: 50,
    completedAt: new Date("2026-05-13T00:00:00.000Z"),
    results: [
      {
        questionId: "question-1",
        selectedOptionId: "option-1",
        isCorrect: true,
        correctOptionId: "option-1",
        explanation: "Explanation",
      },
      {
        questionId: "question-2",
        selectedOptionId: "option-2",
        isCorrect: false,
        correctOptionId: "option-3",
        explanation: null,
      },
    ],
  });

  assert.equal(result.wrongCount, 1);
  assert.equal(result.results.length, 2);
  assert.equal(result.results[1].correctOptionId, "option-3");
});
