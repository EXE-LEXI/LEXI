const assert = require("node:assert/strict");
const test = require("node:test");
require("reflect-metadata");
const { GUARDS_METADATA } = require("@nestjs/common/constants");
const {
  JwtAuthGuard,
} = require("../dist/src/modules/auth/guards/jwt-auth.guard");
const { RolesGuard } = require("../dist/src/modules/auth/guards/roles.guard");
const {
  AdminNotificationsController,
} = require("../dist/src/modules/admin-content/controllers/admin-notifications.controller");

test("admin notification delivery logs require admin auth guards", () => {
  const guards =
    Reflect.getMetadata(GUARDS_METADATA, AdminNotificationsController) ?? [];

  assert.equal(guards.includes(JwtAuthGuard), true);
  assert.equal(guards.includes(RolesGuard), true);
});
