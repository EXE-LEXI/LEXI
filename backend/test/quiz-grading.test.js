const assert = require("node:assert/strict");
const test = require("node:test");
const { BadRequestException } = require("@nestjs/common");
const {
  QuizGradingService,
} = require("../dist/src/modules/learning/lessons/services/quiz-grading.service");

const questions = [
  {
    id: "q1",
    explanation: "Explanation 1",
    options: [
      { id: "q1-a", isCorrect: false },
      { id: "q1-b", isCorrect: true },
    ],
  },
  {
    id: "q2",
    explanation: "Explanation 2",
    options: [
      { id: "q2-a", isCorrect: true },
      { id: "q2-b", isCorrect: false },
    ],
  },
];

test("grades quiz submissions and returns explanations", () => {
  const service = new QuizGradingService();

  const result = service.gradeQuiz(questions, [
    { questionId: "q1", optionId: "q1-b" },
    { questionId: "q2", optionId: "q2-b" },
  ]);

  assert.equal(result.correctCount, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.score, 50);
  assert.deepEqual(result.normalizedAnswers, [
    {
      questionId: "q1",
      selectedOptionId: "q1-b",
      isCorrect: true,
      correctOptionId: "q1-b",
      explanation: "Explanation 1",
    },
    {
      questionId: "q2",
      selectedOptionId: "q2-b",
      isCorrect: false,
      correctOptionId: "q2-a",
      explanation: "Explanation 2",
    },
  ]);
});

test("rejects duplicate answers", () => {
  const service = new QuizGradingService();

  assert.throws(
    () =>
      service.gradeQuiz(questions, [
        { questionId: "q1", optionId: "q1-b" },
        { questionId: "q1", optionId: "q1-a" },
      ]),
    BadRequestException
  );
});

test("rejects incomplete submissions", () => {
  const service = new QuizGradingService();

  assert.throws(
    () =>
      service.gradeQuiz(questions, [{ questionId: "q1", optionId: "q1-b" }]),
    BadRequestException
  );
});

test("rejects an option that does not belong to the question", () => {
  const service = new QuizGradingService();

  assert.throws(
    () =>
      service.gradeQuiz(questions, [
        { questionId: "q1", optionId: "q2-a" },
        { questionId: "q2", optionId: "q2-a" },
      ]),
    BadRequestException
  );
});
