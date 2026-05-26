const assert = require("node:assert/strict");
const test = require("node:test");
const { firstValueFrom, of } = require("rxjs");
const {
  ResponseTransformInterceptor,
} = require("../dist/src/common/interceptors/response-transform.interceptor");

test("response interceptor wraps raw data in the standard success contract", async () => {
  const interceptor = new ResponseTransformInterceptor();

  const result = await firstValueFrom(
    interceptor.intercept({}, { handle: () => of({ id: "user-1" }) })
  );

  assert.deepEqual(result, {
    success: true,
    data: { id: "user-1" },
    message: "OK",
  });
});

test("response interceptor does not wrap an existing success contract twice", async () => {
  const interceptor = new ResponseTransformInterceptor();
  const response = {
    success: true,
    data: { id: "user-1" },
    message: "OK",
  };

  const result = await firstValueFrom(
    interceptor.intercept({}, { handle: () => of(response) })
  );

  assert.deepEqual(result, response);
});
