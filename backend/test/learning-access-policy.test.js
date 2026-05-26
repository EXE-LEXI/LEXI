const assert = require("node:assert/strict");
const test = require("node:test");
require("reflect-metadata");
const { GUARDS_METADATA } = require("@nestjs/common/constants");
const {
  JwtAuthGuard,
} = require("../dist/src/modules/auth/guards/jwt-auth.guard");
const {
  CategoriesController,
} = require("../dist/src/modules/learning/categories/controllers/categories.controller");
const {
  ModulesController,
} = require("../dist/src/modules/learning/modules/controllers/modules.controller");
const {
  LessonsController,
} = require("../dist/src/modules/learning/lessons/controllers/lessons.controller");
const {
  ProgressController,
} = require("../dist/src/modules/learning/progress/controllers/progress.controller");
const {
  ReviewMistakesController,
} = require("../dist/src/modules/learning/review/controllers/review-mistakes.controller");

const protectedLearningControllers = [
  CategoriesController,
  ModulesController,
  LessonsController,
  ProgressController,
  ReviewMistakesController,
];

test("learning controllers require JWT authentication", () => {
  for (const Controller of protectedLearningControllers) {
    const guards = Reflect.getMetadata(GUARDS_METADATA, Controller) ?? [];

    assert.equal(
      guards.includes(JwtAuthGuard),
      true,
      `${Controller.name} should use JwtAuthGuard`
    );
  }
});
