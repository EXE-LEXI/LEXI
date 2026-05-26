const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DailyReminderWorker,
} = require("../dist/src/modules/notification/services/daily-reminder.worker");

test("daily reminder sends only at the user's local reminder hour", async () => {
  const sent = [];
  const revoked = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          reminderHour: 20,
          timezone: "Asia/Bangkok",
        }),
      ],
      revoked,
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T13:15:00.000Z"));

  assert.deepEqual(sent, [
    {
      token: "token-1",
      title: "Đến giờ học phòng vệ rồi!",
      data: { type: "DAILY_REMINDER" },
    },
  ]);
  assert.deepEqual(revoked, []);
});

test("daily reminder skips users who already completed a lesson today", async () => {
  const sent = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          reminderHour: 20,
          timezone: "Asia/Bangkok",
        }),
      ],
      completedAttemptCount: 1,
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T13:15:00.000Z"));

  assert.deepEqual(sent, []);
});

test("daily reminder respects quiet hours", async () => {
  const sent = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          reminderHour: 22,
          timezone: "Asia/Bangkok",
          quietHoursStart: 22,
          quietHoursEnd: 7,
        }),
      ],
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T15:15:00.000Z"));

  assert.deepEqual(sent, []);
});

test("daily reminder revokes invalid Firebase tokens", async () => {
  const sent = [];
  const revoked = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "invalid-token",
          reminderHour: 20,
          timezone: "Asia/Bangkok",
        }),
      ],
      revoked,
    }),
    {
      sendToDevice: async () => ({ success: false, invalidToken: true }),
    }
  );

  const now = new Date("2026-05-19T13:15:00.000Z");
  await worker.handleDailyReminders(now);

  assert.deepEqual(sent, []);
  assert.deepEqual(revoked, [{ token: "invalid-token", revokedAt: now }]);
});

test("daily reminder skips duplicate delivery for the same local day", async () => {
  const sent = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          reminderHour: 20,
          timezone: "Asia/Bangkok",
        }),
      ],
      deliveryAlreadyExists: true,
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T13:15:00.000Z"));

  assert.deepEqual(sent, []);
});

test("streak reminder targets users with an active streak and no study today", async () => {
  const sent = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          dailyReminderEnabled: false,
          streakReminderEnabled: true,
          reminderHour: 20,
          timezone: "Asia/Bangkok",
          streak: 3,
        }),
      ],
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T13:15:00.000Z"));

  assert.deepEqual(sent, [
    {
      token: "token-1",
      title: "Đừng để mất chuỗi học tập!",
      data: { type: "STREAK_REMINDER" },
    },
  ]);
});

test("review reminder targets users who have review mistakes", async () => {
  const sent = [];
  const worker = new DailyReminderWorker(
    makePrisma({
      users: [
        makeUser({
          id: "user-1",
          token: "token-1",
          dailyReminderEnabled: false,
          reviewReminderEnabled: true,
          reminderHour: 20,
          timezone: "Asia/Bangkok",
        }),
      ],
      reviewMistakeCount: 2,
    }),
    makeFirebase(sent)
  );

  await worker.handleDailyReminders(new Date("2026-05-19T13:15:00.000Z"));

  assert.deepEqual(sent, [
    {
      token: "token-1",
      title: "Có câu sai đang chờ bạn ôn lại",
      data: { type: "REVIEW_REMINDER" },
    },
  ]);
});

function makePrisma({
  users,
  completedAttemptCount = 0,
  reviewMistakeCount = 0,
  revoked = [],
  deliveryLogs = [],
  deliveryAlreadyExists = false,
}) {
  return {
    user: {
      findMany: async () => users,
    },
    lessonAttempt: {
      count: async (args) => {
        assert.equal(args.where.userId, "user-1");
        assert.ok(args.where.finishedAt.gte instanceof Date);
        assert.ok(args.where.finishedAt.lt instanceof Date);
        return completedAttemptCount;
      },
    },
    userAnswer: {
      count: async (args) => {
        assert.equal(args.where.isCorrect, false);
        assert.equal(args.where.attempt.userId, "user-1");
        assert.equal(args.where.attempt.lesson.isActive, true);
        assert.equal(args.where.attempt.lesson.reviewStatus, "PUBLISHED");
        return reviewMistakeCount;
      },
    },
    deviceToken: {
      updateMany: async (args) => {
        revoked.push({
          token: args.where.token,
          revokedAt: args.data.revokedAt,
        });
        return { count: 1 };
      },
    },
    notificationDeliveryLog: {
      create: async (args) => {
        if (deliveryAlreadyExists) {
          const error = new Error("Notification delivery already exists");
          error.code = "P2002";
          throw error;
        }

        const deliveryLog = {
          id: `delivery-${deliveryLogs.length + 1}`,
          ...args.data,
        };
        deliveryLogs.push({ action: "create", data: args.data });
        return deliveryLog;
      },
      update: async (args) => {
        deliveryLogs.push({
          action: "update",
          where: args.where,
          data: args.data,
        });
        return { id: args.where.id, ...args.data };
      },
    },
  };
}

function makeFirebase(sent) {
  return {
    sendToDevice: async (token, title, _body, data) => {
      sent.push({ token, title, data });
      return { success: true, invalidToken: false };
    },
  };
}

function makeUser({
  id,
  token,
  reminderHour,
  timezone,
  quietHoursStart = null,
  quietHoursEnd = null,
  dailyReminderEnabled = true,
  streakReminderEnabled = true,
  reviewReminderEnabled = true,
  streak = 0,
}) {
  return {
    id,
    profile: { streak },
    notificationPreference: {
      dailyReminderEnabled,
      streakReminderEnabled,
      reviewReminderEnabled,
      reminderHour,
      timezone,
      quietHoursStart,
      quietHoursEnd,
    },
    deviceTokens: [{ token, revokedAt: null }],
  };
}
