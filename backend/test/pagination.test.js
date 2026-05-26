const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildPaginationMeta,
} = require("../dist/src/common/dto/pagination-meta.dto");
const {
  ModulesMapper,
} = require("../dist/src/modules/learning/modules/mappers/modules.mapper");

test("pagination meta reports page boundaries", () => {
  const meta = buildPaginationMeta({
    total: 45,
    page: 2,
    limit: 20,
  });

  assert.deepEqual(meta, {
    total: 45,
    page: 2,
    limit: 20,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: true,
  });
});

test("modules mapper returns paginated list response", () => {
  const response = ModulesMapper.toPaginatedResponse({
    total: 1,
    page: 1,
    limit: 20,
    modules: [
      {
        id: "module-1",
        categoryId: "category-1",
        slug: "module-one",
        title: "Module one",
        description: null,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date("2026-05-13T00:00:00.000Z"),
        updatedAt: new Date("2026-05-13T00:00:00.000Z"),
        lessons: [
          {
            id: "lesson-1",
            title: "Lesson one",
            sortOrder: 1,
          },
        ],
      },
    ],
  });

  assert.equal(response.items[0].id, "module-1");
  assert.equal(response.items[0].lessons[0].id, "lesson-1");
  assert.equal(response.meta.total, 1);
  assert.equal(response.meta.hasNextPage, false);
});
