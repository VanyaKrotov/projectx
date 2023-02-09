import { test, expect, describe } from "@jest/globals";

import {
  createUniqPath,
  isEqualArray,
  isFunction,
  isObject,
  runAfterScript,
} from "../utils";

test("isObject", () => {
  class Test {}

  expect(isObject({ val: 1 })).toBe(true);
  expect(isObject(new Test())).toBe(true);
  expect(isObject(Test)).toBe(false);
  expect(isObject(() => {})).toBe(false);
  expect(isObject(10)).toBe(false);
  expect(isObject("test")).toBe(false);
});

test("isFunction", () => {
  expect(isFunction(() => {})).toBe(true);
  expect(isFunction(async () => {})).toBe(true);
});

test("createUniqPath", () => {
  expect(createUniqPath()).toBe("ObservableState#0");
  expect(createUniqPath("State")).toBe("State#1");
  expect(createUniqPath("State")).toBe("State#2");
});

test("isEqualArray", () => {
  expect(isEqualArray([], [])).toBe(true);
  expect(isEqualArray([1], [1])).toBe(true);
  expect(isEqualArray([1, 2, 4], [1])).toBe(false);
  expect(isEqualArray(["1", "2"], ["2", "1"])).toBe(true);
  expect(isEqualArray(["1", "2"], ["2", "2"])).toBe(false);
});

test("runAfterScript", async () => {
  const res = [];

  res.push("script start");

  runAfterScript(() => {
    res.push("script after");
  });

  res.push("script end");

  runAfterScript(() => {
    res.push("script after 2");
  });

  await Promise.resolve();

  expect(res).toEqual([
    "script start",
    "script end",
    "script after",
    "script after 2",
  ]);
});
