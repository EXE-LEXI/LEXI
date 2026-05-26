const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcrypt");
const { UserRole, UserStatus } = require("@prisma/client");
const {
  AuthService,
} = require("../dist/src/modules/auth/services/auth.service");

test("auth service rotates refresh tokens", async () => {
  const passwordHash = await bcrypt.hash("secret123", 4);
  const repository = createAuthRepository(passwordHash);
  const service = new AuthService(
    repository,
    createJwtService(),
    createConfigService()
  );

  const loginResponse = await service.login({
    email: "user@example.com",
    password: "secret123",
  });
  const firstTokenRecord = repository.refreshTokens[0];

  const refreshResponse = await service.refresh(loginResponse.refreshToken);

  assert.ok(firstTokenRecord.revokedAt instanceof Date);
  assert.equal(repository.refreshTokens.length, 2);
  assert.notEqual(refreshResponse.refreshToken, loginResponse.refreshToken);
});

test("auth service revokes refresh tokens on logout", async () => {
  const passwordHash = await bcrypt.hash("secret123", 4);
  const repository = createAuthRepository(passwordHash);
  const service = new AuthService(
    repository,
    createJwtService(),
    createConfigService()
  );

  const loginResponse = await service.login({
    email: "user@example.com",
    password: "secret123",
  });

  const result = await service.logout(loginResponse.refreshToken);

  assert.deepEqual(result, { loggedOut: true });
  assert.ok(repository.refreshTokens[0].revokedAt instanceof Date);
});

test("auth service rejects reuse of a rotated refresh token", async () => {
  const passwordHash = await bcrypt.hash("secret123", 4);
  const repository = createAuthRepository(passwordHash);
  const service = new AuthService(
    repository,
    createJwtService(),
    createConfigService()
  );

  const loginResponse = await service.login({
    email: "user@example.com",
    password: "secret123",
  });

  await service.refresh(loginResponse.refreshToken);

  await assert.rejects(
    () => service.refresh(loginResponse.refreshToken),
    /Invalid refresh token/
  );
  assert.equal(repository.refreshTokens.length, 2);
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

    findUserCredentialsByEmail: async () => ({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
    }),

    findAuthUserById: async () => user,

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
    get: () => "test-secret",
  };
}
