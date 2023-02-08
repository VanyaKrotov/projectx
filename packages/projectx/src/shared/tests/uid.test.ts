import { test, expect } from "@jest/globals";

import { uid } from "shared/uid";

test("uid", () => {
  expect(uid()).toBe(0);
  expect(uid()).toBe(1);
  expect(uid()).toBe(2);
  expect(uid()).toBe(3);
});
