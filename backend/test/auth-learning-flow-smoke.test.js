const assert = require("node:assert/strict");
const test = require("node:test");
const { UserRole, UserStatus } = require("@prisma/client");
const {
  AuthService,
} = require("../dist/src/modules/auth/services/auth.service");
const {
  LessonProgressService,
} = require("../dist/src/modules/learning/lessons/services/lesson-progress.service");
const {
  QuizGradingService,
} = require("../dist/src/modules/learning/lessons/services/quiz-grading.service");
const {
  QuizSubmissionService,
} = require("../dist/src/modules/learning/lessons/services/quiz-submission.service");
const {
  RewardService,
} = require("../dist/src/modules/learning/lessons/services/reward.service");

test("auth and quiz submission smoke flow", async () => {
  const authRepository = createAuthRepository();
  const authService = new AuthService(
    authRepository,
    createJwtService(),
    createConfigService()
  );

  const registerResponse = await authService.register({
    email: "learner@example.com",
    password: "secret123",
    fullName: "Lexi Learner",
  });
  const loginResponse = await authService.login({
    email: "learner@example.com",
    password: "secret123",
  });

  assert.equal(registerResponse.user.email, "learner@example.com");
  assert.ok(registerResponse.accessToken);
  assert.ok(loginResponse.refreshToken);

  const quizService = new QuizSubmissionService(
    createPrismaForQuizSubmission(),
    createLessonQueryService(),
    new QuizGradingService(),
    new LessonProgressService(),
    new RewardService(),
    { awardEarnedBadges: async () => {} }
  );

  const quizResponse = await quizService.submitQuiz(
    "lesson-1",
    registerResponse.user.id,
    [
      { questionId: "q1", optionId: "q1-b" },
      { questionId: "q2", optionId: "q2-a" },
    ]
  );

  assert.equal(quizResponse.score, 50);
  assert.equal(quizResponse.correctCount, 1);
  assert.equal(quizResponse.wrongCount, 1);
  assert.equal(quizResponse.xpAwarded, 50);
  assert.equal(quizResponse.results.length, 2);
});

function createAuthRepository() {
  const repository = {
    user: null,
    refreshTokens: [],

    findUserIdByEmail: async (email) =>
      repository.user?.email === email ? { id: repository.user.id } : null,

    findUserCredentialsByEmail: async (email) =>
      repository.user?.email === email
        ? {
            id: repository.user.id,
            email: repository.user.email,
            passwordHash: repository.user.passwordHash,
            status: repository.user.status,
          }
        : null,

    createUser: async (dto, passwordHash) => {
      repository.user = {
        id: "user-1",
        email: dto.email,
        passwordHash,
        role: UserRole.LEARNER,
        status: UserStatus.ACTIVE,
        createdAt: new Date("2026-05-13T00:00:00.000Z"),
        updatedAt: new Date("2026-05-13T00:00:00.000Z"),
        profile: {
          id: "profile-1",
          userId: "user-1",
          fullName: dto.fullName,
          avatarUrl: null,
          xp: 0,
          streak: 0,
          createdAt: new Date("2026-05-13T00:00:00.000Z"),
          updatedAt: new Date("2026-05-13T00:00:00.000Z"),
        },
      };

      return repository.user;
    },

    findAuthUserById: async (userId) =>
      repository.user?.id === userId ? repository.user : null,

    createRefreshToken: async (data) => {
      const record = {
        id: `token-${repository.refreshTokens.length + 1}`,
        ...data,
        revokedAt: null,
      };
      repository.refreshTokens.push(record);
      return record;
    },
  };

  return repository;
}

function createJwtService() {
  return {
    signAsync: async (payload) =>
      payload.type === "refresh"
        ? `refresh:${payload.sub}:${payload.email}:${payload.jti}`
        : `access:${payload.sub}:${payload.email}`,
  };
}

function createConfigService() {
  return {
    get: () => "test-secret",
  };
}

function createLessonQueryService() {
  return {
    getLessonForSubmission: async () => ({
      id: "lesson-1",
      questions: [
        {
          id: "q1",
          explanation: "Q1 explanation",
          options: [
            { id: "q1-a", isCorrect: false },
            { id: "q1-b", isCorrect: true },
          ],
        },
        {
          id: "q2",
          explanation: "Q2 explanation",
          options: [
            { id: "q2-a", isCorrect: false },
            { id: "q2-b", isCorrect: true },
          ],
        },
      ],
    }),
  };
}

function createPrismaForQuizSubmission() {
  const tx = {
    lessonAttempt: {
      aggregate: async () => ({
        _max: {
          score: null,
        },
      }),
      create: async () => ({
        id: "attempt-1",
      }),
    },
    userProgress: {
      findUnique: async () => null,
      upsert: async () => ({}),
    },
    userProfile: {
      updateMany: async () => ({
        count: 1,
      }),
    },
  };

  return {
    $transaction: async (callback) => callback(tx),
  };
}
