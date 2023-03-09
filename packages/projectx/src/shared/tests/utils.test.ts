import { test, expect } from "@jest/globals";

import {
  getAllObjectFields,
  isFunction,
  isObject,
  isObjectOfClass,
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

test("isObjectOfClass", async () => {
  const obj = { value: 10 };

  class A {
    val = 10;
  }

  class B extends A {}

  expect(isObjectOfClass(obj)).toBe(false);
  expect(isObjectOfClass({})).toBe(false);
  expect(isObjectOfClass(new A())).toBe(true);
  expect(isObjectOfClass(new B())).toBe(true);
  expect(isObjectOfClass(undefined as any)).toBe(false);
  expect(isObjectOfClass(null as any)).toBe(false);
  expect(isObjectOfClass(1 as any)).toBe(false);
  expect(isObjectOfClass("1" as any)).toBe(false);
  expect(isObjectOfClass((() => {}) as any)).toBe(false);
});

test("getFieldsOfObject", () => {
  class A {
    value = 10;
  }

  class B extends A {
    get r() {
      return 12;
    }
  }

  expect(Object.keys(getAllObjectFields(new A()))).toEqual([
    "constructor",
    "value",
  ]);
  expect(Object.keys(getAllObjectFields(new B()))).toEqual([
    "constructor",
    "r",
    "value",
  ]);
  expect(Object.keys(getAllObjectFields({}))).toEqual([]);
  expect(Object.keys(getAllObjectFields({ test: 10 }))).toEqual(["test"]);
});
