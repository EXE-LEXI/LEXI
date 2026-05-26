const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcrypt");
const { UserStatus } = require("@prisma/client");
const {
  AuthService,
} = require("../dist/src/modules/auth/services/auth.service");

test("auth service rejects duplicate registration email", async () => {
  const service = new AuthService(
    {
      findUserIdByEmail: async () => ({ id: "user-1" }),
    },
    createJwtService(),
    createConfigService()
  );

  await assert.rejects(
    () =>
      service.register({
        email: "user@example.com",
        password: "secret123",
        fullName: "Lexi Learner",
      }),
    /Email already exists/
  );
});

test("auth service rejects invalid login password", async () => {
  const passwordHash = await bcrypt.hash("secret123", 4);
  const service = new AuthService(
    {
      findUserCredentialsByEmail: async () => ({
        id: "user-1",
        email: "user@example.com",
        passwordHash,
        status: UserStatus.ACTIVE,
      }),
    },
    createJwtService(),
    createConfigService()
  );

  await assert.rejects(
    () =>
      service.login({
        email: "user@example.com",
        password: "wrong-password",
      }),
    /Invalid email or password/
  );
});

test("auth service rejects inactive accounts", async () => {
  const passwordHash = await bcrypt.hash("secret123", 4);
  const service = new AuthService(
    {
      findUserCredentialsByEmail: async () => ({
        id: "user-1",
        email: "user@example.com",
        passwordHash,
        status: UserStatus.BANNED,
      }),
    },
    createJwtService(),
    createConfigService()
  );

  await assert.rejects(
    () =>
      service.login({
        email: "user@example.com",
        password: "secret123",
      }),
    /Account is not active/
  );
});

function createJwtService() {
  return {
    signAsync: async () => "token",
  };
}

function createConfigService() {
  return {
    get: () => "test-secret",
  };
}
