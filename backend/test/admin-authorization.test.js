const assert = require("node:assert/strict");
const test = require("node:test");
require("reflect-metadata");
const { UserRole } = require("@prisma/client");
const {
  ROLES_KEY,
  Roles,
} = require("../dist/src/modules/auth/decorators/roles.decorator");
const { RolesGuard } = require("../dist/src/modules/auth/guards/roles.guard");
const {
  AdminLessonsController,
} = require("../dist/src/modules/admin-content/controllers/admin-lessons.controller");

test("roles decorator stores required roles metadata", () => {
  class AdminOnlyController {}

  Roles(UserRole.ADMIN)(AdminOnlyController);

  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, AdminOnlyController), [
    UserRole.ADMIN,
  ]);
});

test("admin lesson endpoints require admin role metadata", () => {
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, AdminLessonsController), [
    UserRole.ADMIN,
  ]);
});

test("roles guard blocks learners and allows admins", () => {
  const guard = new RolesGuard({
    getAllAndOverride: () => [UserRole.ADMIN],
  });

  assert.equal(guard.canActivate(makeContext(UserRole.LEARNER)), false);
  assert.equal(guard.canActivate(makeContext(UserRole.ADMIN)), true);
});

test("roles guard allows routes with no required roles", () => {
  const guard = new RolesGuard({
    getAllAndOverride: () => [],
  });

  assert.equal(guard.canActivate(makeContext(UserRole.LEARNER)), true);
});

function makeContext(role) {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          id: "user-1",
          role,
        },
      }),
    }),
  };
}
