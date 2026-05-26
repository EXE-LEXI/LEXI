const assert = require("node:assert/strict");
const test = require("node:test");
const { NotFoundException } = require("@nestjs/common");
const { DeviceTokenPlatform } = require("@prisma/client");
const {
  DeviceTokensService,
} = require("../dist/src/modules/notification/services/device-tokens.service");
const {
  DeviceTokensRepository,
} = require("../dist/src/modules/notification/repositories/device-tokens.repository");

test("device token service upserts a token for the current user", async () => {
  const calls = [];
  const now = new Date("2026-05-18T09:00:00.000Z");
  const service = new DeviceTokensService({
    upsertDeviceToken: async (args) => {
      calls.push(args);
      return makeDeviceToken(args, now);
    },
  });

  const result = await service.upsertDeviceToken(
    "user-1",
    {
      token: "fcm-token-1",
      platform: DeviceTokenPlatform.ANDROID,
      deviceId: "pixel-8",
      appVersion: "1.0.0",
    },
    now
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].userId, "user-1");
  assert.equal(calls[0].token, "fcm-token-1");
  assert.equal(calls[0].platform, DeviceTokenPlatform.ANDROID);
  assert.equal(calls[0].lastSeenAt, now);
  assert.equal(result.userId, undefined);
  assert.equal(result.token, "fcm-token-1");
  assert.equal(result.revokedAt, null);
});

test("device token service rejects revoke when token is not owned by current user", async () => {
  const service = new DeviceTokensService({
    revokeDeviceToken: async (userId, token) => {
      assert.equal(userId, "user-1");
      assert.equal(token, "other-user-token");
      return { count: 0 };
    },
  });

  await assert.rejects(
    () => service.revokeDeviceToken("user-1", "other-user-token"),
    NotFoundException
  );
});

test("device token repository revokes only the current user's active token", async () => {
  const calls = [];
  const prisma = {
    deviceToken: {
      updateMany: async (args) => {
        calls.push(args);
        return { count: 1 };
      },
    },
  };
  const repository = new DeviceTokensRepository(prisma);
  const revokedAt = new Date("2026-05-18T09:10:00.000Z");

  const result = await repository.revokeDeviceToken(
    "user-1",
    "fcm-token-1",
    revokedAt
  );

  assert.equal(result.count, 1);
  assert.deepEqual(calls[0].where, {
    userId: "user-1",
    token: "fcm-token-1",
    revokedAt: null,
  });
  assert.deepEqual(calls[0].data, { revokedAt });
});

function makeDeviceToken(args, now) {
  return {
    id: "device-token-1",
    userId: args.userId,
    token: args.token,
    platform: args.platform,
    deviceId: args.deviceId ?? null,
    appVersion: args.appVersion ?? null,
    lastSeenAt: args.lastSeenAt,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
