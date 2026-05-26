const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createValidationException,
  flattenValidationErrors,
} = require("../dist/src/common/validation/validation-exception.factory");

test("validation errors are flattened into field-level details", () => {
  const details = flattenValidationErrors([
    {
      property: "answers",
      children: [
        {
          property: "0",
          children: [
            {
              property: "questionId",
              constraints: {
                isNotEmpty: "questionId should not be empty",
              },
              children: [],
            },
          ],
        },
      ],
    },
  ]);

  assert.deepEqual(details, [
    {
      field: "answers.0.questionId",
      messages: ["questionId should not be empty"],
    },
  ]);
});

test("validation exception uses the standard validation error code", () => {
  const exception = createValidationException([
    {
      property: "email",
      constraints: {
        isEmail: "email must be an email",
      },
      children: [],
    },
  ]);
  const response = exception.getResponse();

  assert.equal(response.error, "VALIDATION_ERROR");
  assert.equal(response.message, "Validation failed");
  assert.deepEqual(response.details, [
    {
      field: "email",
      messages: ["email must be an email"],
    },
  ]);
});
