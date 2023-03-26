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
    expect(Path.get(new Set([12, { test: 12 }]), "1.test")).toBe(12);
    expect(Path.get(new Set([12, { test: 12 }]), "0")).toBe(12);
    expect(Path.get(new Set([12, { test: 12 }]), "3")).toBe(null);
    expect(Path.get(new Map([["key", { test: 12 }]]), "key.test")).toBe(12);
    expect(Path.get(new Map([["key", { test: 12 }]]), "key")).toEqual({
      test: 12,
    });
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

    expect(Path.set(obj, "next.next.value", 30)).toEqual(true);

    expect(Path.set(obj, "array.1", null)).toBe(true);
    expect(obj.array[1]).toBeNull();

    expect(Path.set(obj, "array[1]", 10)).toBe(false);
    expect(Path.set(null as any, "array.1", 10)).toBe(false);

    const val = new Set([{ test: { value: 1 } }]);
    expect(Path.set(val, "0.test.value", 22)).toBe(true);
    expect(Path.get(val, "0.test.value")).toBe(22);

    expect(Path.has(val, "0.test.test")).toBe(false);
    expect(Path.set(val, "0.test.test", 12)).toBe(true);
    expect(Path.has(val, "0.test.test")).toBe(true);
    expect(Path.get(val, "0.test.test")).toBe(12);

    const map = new Map([["test", new Set([12, { array: [1, 2, 3] }])]]);
    expect(Path.set(map, "test.1.array.0", 5)).toBe(true);
    expect(Path.get(map, "test.1.array.0")).toBe(5);
  });

  test("has", () => {
    const obj = {
      array: [{ value: 10 }],
      test: 10,
      deep: { value: { test: 1 } },
      next: null,
    };

    expect(Path.has(obj, "")).toBe(false);
    expect(Path.has(obj, "next.next")).toBe(false);
    expect(Path.has(obj, "array")).toBe(true);
    expect(Path.has(obj, "array.0")).toBe(true);
    expect(Path.has(obj, "array.0.value")).toBe(true);
    expect(Path.has(obj, "array.0.test")).toBe(false);
    expect(Path.has(obj, "test")).toBe(true);
    expect(Path.has(obj, "deep.value.test")).toBe(true);
    expect(Path.has(null as any, "deep.value.test")).toBe(false);
    expect(Path.has(new Set([12, { test: 12 }]), "1.test")).toBe(true);
    expect(Path.has(new Set([12, { test: 12 }]), "0")).toBe(true);
    expect(Path.has(new Set([12, { test: 12 }]), "3")).toBe(false);
    expect(Path.has(new Map([["key", { test: 12 }]]), "key.test")).toBe(true);
    expect(Path.has(new Map([["key", { test: 12 }]]), "key")).toBe(true);
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
