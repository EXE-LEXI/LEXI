const assert = require("node:assert/strict");
const test = require("node:test");
const {
  NotificationPreferencesService,
} = require("../dist/src/modules/notification/services/notification-preferences.service");
const {
  NotificationPreferencesRepository,
} = require("../dist/src/modules/notification/repositories/notification-preferences.repository");

test("notification preferences service creates defaults when missing", async () => {
  const calls = [];
  const service = new NotificationPreferencesService({
    findByUserId: async (userId) => {
      calls.push(["find", userId]);
      return null;
    },
    createDefault: async (userId) => {
      calls.push(["create", userId]);
      return makePreference({ userId });
    },
  });

  const result = await service.getPreferences("user-1");

  assert.deepEqual(calls, [
    ["find", "user-1"],
    ["create", "user-1"],
  ]);
  assert.equal(result.dailyReminderEnabled, true);
  assert.equal(result.streakReminderEnabled, true);
  assert.equal(result.reviewReminderEnabled, true);
  assert.equal(result.reminderHour, 20);
  assert.equal(result.timezone, "Asia/Bangkok");
});

test("notification preferences service updates only supplied fields", async () => {
  const calls = [];
  const service = new NotificationPreferencesService({
    upsertForUser: async (userId, data) => {
      calls.push({ userId, data });
      return makePreference({
        userId,
        dailyReminderEnabled: data.dailyReminderEnabled ?? true,
        reminderHour: data.reminderHour ?? 20,
        timezone: data.timezone ?? "Asia/Bangkok",
      });
    },
  });

  const result = await service.updatePreferences("user-1", {
    dailyReminderEnabled: false,
    reminderHour: 8,
    timezone: "Asia/Bangkok",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].userId, "user-1");
  assert.deepEqual(calls[0].data, {
    dailyReminderEnabled: false,
    reminderHour: 8,
    timezone: "Asia/Bangkok",
  });
  assert.equal(result.dailyReminderEnabled, false);
  assert.equal(result.reminderHour, 8);
});

test("notification preferences repository reads and upserts by current user id", async () => {
  const calls = [];
  const prisma = {
    notificationPreference: {
      findUnique: async (args) => {
        calls.push(["findUnique", args]);
        return null;
      },
      upsert: async (args) => {
        calls.push(["upsert", args]);
        return makePreference({
          userId: args.where.userId,
          reminderHour: args.update.reminderHour,
        });
      },
    },
  };
  const repository = new NotificationPreferencesRepository(prisma);

  await repository.findByUserId("user-1");
  await repository.upsertForUser("user-1", { reminderHour: 7 });

  assert.deepEqual(calls[0], ["findUnique", { where: { userId: "user-1" } }]);
  assert.deepEqual(calls[1][1].where, { userId: "user-1" });
  assert.deepEqual(calls[1][1].create, {
    userId: "user-1",
    reminderHour: 7,
  });
  assert.deepEqual(calls[1][1].update, { reminderHour: 7 });
});

function makePreference(overrides = {}) {
  const now = new Date("2026-05-18T10:00:00.000Z");

  return {
    id: "notification-preference-1",
    userId: overrides.userId ?? "user-1",
    dailyReminderEnabled: overrides.dailyReminderEnabled ?? true,
    streakReminderEnabled: overrides.streakReminderEnabled ?? true,
    reviewReminderEnabled: overrides.reviewReminderEnabled ?? true,
    reminderHour: overrides.reminderHour ?? 20,
    timezone: overrides.timezone ?? "Asia/Bangkok",
    quietHoursStart: overrides.quietHoursStart ?? null,
    quietHoursEnd: overrides.quietHoursEnd ?? null,
    createdAt: now,
    updatedAt: now,
  };
}
