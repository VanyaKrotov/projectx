import { describe, test, expect } from "@jest/globals";

import { Path } from "../path";

describe("path", () => {
  test("get", () => {
    const obj = {
      array: [{ value: 10 }],
      test: 10,
      deep: { value: { test: 1 } },
      next: null,
    };

    expect(Path.get(obj, "")).toEqual(obj);
    expect(Path.get(obj, "next.next")).toEqual(null);
    expect(Path.get(obj, "array")).toEqual(obj.array);
    expect(Path.get(obj, "array.0")).toEqual(obj.array[0]);
    expect(Path.get(obj, "array.0.value")).toBe(obj.array[0].value);
    expect(Path.get(obj, "array.0.test")).toBeNull();
    expect(Path.get(obj, "test")).toBe(obj.test);
    expect(Path.get(obj, "deep.value.test")).toBe(obj.deep.value.test);
    expect(Path.get(null as any, "deep.value.test")).toBeNull();
  });

  test("set", () => {
    const obj = {
      value: 10,
      next: {
        value: 11,
      },
      array: [1, 4, 7],
    };

    expect(Path.set(obj, "value", 30)).toEqual(true);
    expect(obj.value).toEqual(30);

    expect(Path.set(obj, "next.value", 30)).toEqual(true);
    expect(obj.next.value).toEqual(30);

    expect(Path.set(obj, "next.next.value", 30)).toEqual(false);

    expect(Path.set(obj, "array.1", null)).toBe(true);
    expect(obj.array[1]).toBeNull();

    expect(Path.set(obj, "array[1]", 10)).toBe(false);
    expect(Path.set(null as any, "array.1", 10)).toBe(false);
  });

  test("isValid", () => {
    expect(Path.isValid("value")).toEqual(true);
    expect(Path.isValid("value.test.0")).toEqual(true);
    expect(Path.isValid("value.test-1.0")).toEqual(true);
    expect(Path.isValid("value.0")).toEqual(true);
    expect(Path.isValid("value..0")).toEqual(false);
    expect(Path.isValid("value..0")).toEqual(false);
    expect(Path.isValid("value0.")).toEqual(false);
    expect(Path.isValid("")).toEqual(false);
    expect(Path.isValid("0.1")).toEqual(true);
  });

  test("toLodashPath", () => {
    expect(Path.toLodashPath("array.0")).toBe("array[0]");
    expect(Path.toLodashPath("array.test")).toBe("array.test");
    expect(Path.toLodashPath("array.0.test")).toBe("array[0].test");
    expect(Path.toLodashPath("0.test")).toBe("[0].test");
  });
});
