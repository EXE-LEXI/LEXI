const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcrypt");
const { UserRole, UserStatus } = require("@prisma/client");
const {
  AuthService,
} = require("../dist/src/modules/auth/services/auth.service");

test("auth service resets password with a single-use reset token", async () => {
  const passwordHash = await bcrypt.hash("oldpass123", 4);
  const repository = createAuthRepository(passwordHash);
  const service = new AuthService(
    repository,
    createJwtService(),
    createConfigService()
  );

  const loginResponse = await service.login({
    email: "user@example.com",
    password: "oldpass123",
  });

  const request = await service.requestPasswordReset({
    email: "user@example.com",
  });

  assert.equal(request.accepted, true);
  assert.ok(request.resetToken);

  await service.resetPassword({
    token: request.resetToken,
    newPassword: "newpass123",
  });

  assert.ok(repository.refreshTokens[0].revokedAt instanceof Date);
  await assert.rejects(
    () => service.refresh(loginResponse.refreshToken),
    /Invalid refresh token/
  );
  await assert.rejects(
    () =>
      service.login({
        email: "user@example.com",
        password: "oldpass123",
      }),
    /Invalid email or password/
  );

  const nextLogin = await service.login({
    email: "user@example.com",
    password: "newpass123",
  });

  assert.ok(nextLogin.accessToken);
  await assert.rejects(
    () =>
      service.resetPassword({
        token: request.resetToken,
        newPassword: "another123",
      }),
    /Invalid or expired password reset token/
  );
});

test("auth service does not expose reset token for unknown email", async () => {
  const passwordHash = await bcrypt.hash("oldpass123", 4);
  const repository = createAuthRepository(passwordHash);
  const service = new AuthService(
    repository,
    createJwtService(),
    createConfigService()
  );

  const request = await service.requestPasswordReset({
    email: "missing@example.com",
  });

  assert.deepEqual(request, { accepted: true, resetToken: null });
  assert.equal(repository.passwordResetTokens.length, 0);
});

function createAuthRepository(passwordHash) {
  const user = {
    id: "user-1",
    email: "user@example.com",
    passwordHash,
    role: UserRole.LEARNER,
    status: UserStatus.ACTIVE,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    profile: null,
  };

  const repository = {
    refreshTokens: [],
    passwordResetTokens: [],

    findActiveUserIdByEmail: async (email) =>
      email === user.email && user.status === UserStatus.ACTIVE
        ? { id: user.id }
        : null,

    findUserCredentialsByEmail: async (email) =>
      email === user.email
        ? {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            status: user.status,
          }
        : null,

    findAuthUserById: async (userId) => (userId === user.id ? user : null),

    createRefreshToken: async (data) => {
      const record = {
        id: `token-${repository.refreshTokens.length + 1}`,
        ...data,
        revokedAt: null,
      };
      repository.refreshTokens.push(record);
      return record;
    },

    findRefreshTokenByJti: async (jti) =>
      repository.refreshTokens.find((token) => token.jti === jti) ?? null,

    rotateRefreshToken: async (tokenId, data) => {
      const existing = repository.refreshTokens.find(
        (token) => token.id === tokenId
      );
      if (!existing || existing.revokedAt) {
        return null;
      }
      existing.revokedAt = new Date();
      return repository.createRefreshToken(data);
    },

    revokeRefreshToken: async (tokenId) => {
      const existing = repository.refreshTokens.find(
        (token) => token.id === tokenId
      );
      if (!existing || existing.revokedAt) {
        return { count: 0 };
      }
      existing.revokedAt = new Date();
      return { count: 1 };
    },

    createPasswordResetToken: async (data) => {
      const record = {
        id: `reset-${repository.passwordResetTokens.length + 1}`,
        ...data,
        usedAt: null,
      };
      repository.passwordResetTokens.push(record);
      return record;
    },

    consumePasswordResetToken: async (tokenHash, nextPasswordHash) => {
      const token = repository.passwordResetTokens.find(
        (item) =>
          item.tokenHash === tokenHash &&
          !item.usedAt &&
          item.expiresAt.getTime() > Date.now()
      );
      if (!token || user.status !== UserStatus.ACTIVE) {
        return null;
      }

      token.usedAt = new Date();
      user.passwordHash = nextPasswordHash;
      repository.refreshTokens.forEach((refreshToken) => {
        if (refreshToken.userId === user.id && !refreshToken.revokedAt) {
          refreshToken.revokedAt = new Date();
        }
      });
      return { userId: user.id };
    },
  };

  return repository;
}

function createJwtService() {
  return {
    signAsync: async (payload) => {
      if (payload.type === "refresh") {
        return `refresh:${payload.sub}:${payload.email}:${payload.jti}`;
      }

      return `access:${payload.sub}:${payload.email}`;
    },

    verifyAsync: async (token) => {
      const [type, sub, email, jti] = token.split(":");

      return {
        sub,
        email,
        type,
        jti,
      };
    },
  };
}

function createConfigService() {
  return {
    get: (key, defaultValue) => {
      if (key === "NODE_ENV") {
        return "development";
      }
      return defaultValue ?? "test-secret";
    },
  };
}
