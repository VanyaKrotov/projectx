import { test, expect } from "@jest/globals";

import { isObject } from "../shared/utils";

test("isObject", () => {
  const obj = { val: 1 };

  expect(isObject(obj)).toBe(true);
  expect(isObject(() => {})).toBe(false);
  expect(isObject(10)).toBe(false);
  expect(isObject("test")).toBe(false);
});
