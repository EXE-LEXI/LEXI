const assert = require("node:assert/strict");
const test = require("node:test");
require("reflect-metadata");
const { GUARDS_METADATA } = require("@nestjs/common/constants");
const {
  JwtAuthGuard,
} = require("../dist/src/modules/auth/guards/jwt-auth.guard");
const { RolesGuard } = require("../dist/src/modules/auth/guards/roles.guard");
const {
  AdminAiController,
} = require("../dist/src/modules/admin-content/controllers/admin-ai.controller");
const {
  AdminMediaController,
} = require("../dist/src/modules/admin-content/controllers/admin-media.controller");

test("admin AI draft endpoints require admin auth guards", () => {
  const guards = Reflect.getMetadata(GUARDS_METADATA, AdminAiController) ?? [];

  assert.equal(guards.includes(JwtAuthGuard), true);
  assert.equal(guards.includes(RolesGuard), true);
});

test("admin media endpoints require admin auth guards", () => {
  const guards =
    Reflect.getMetadata(GUARDS_METADATA, AdminMediaController) ?? [];

  assert.equal(guards.includes(JwtAuthGuard), true);
  assert.equal(guards.includes(RolesGuard), true);
});
