const assert = require("node:assert/strict");
const test = require("node:test");
require("reflect-metadata");
const { GUARDS_METADATA } = require("@nestjs/common/constants");
const {
  JwtAuthGuard,
} = require("../dist/src/modules/auth/guards/jwt-auth.guard");
const { RolesGuard } = require("../dist/src/modules/auth/guards/roles.guard");
const {
  AdminSourcesController,
} = require("../dist/src/modules/admin-content/controllers/admin-sources.controller");

test("admin legal source endpoints require admin auth guards", () => {
  const guards =
    Reflect.getMetadata(GUARDS_METADATA, AdminSourcesController) ?? [];

  assert.equal(guards.includes(JwtAuthGuard), true);
  assert.equal(guards.includes(RolesGuard), true);
});
