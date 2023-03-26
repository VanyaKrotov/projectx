import { isNull, isUndefined } from "../shared";

function getRecursive<T>(target: object, path: string[]): T | null {
  if (!path.length) {
    return target as T;
  }

  if (isNull(target) || isUndefined(target)) {
    return null;
  }

  let next = undefined;
  const [first, ...rest] = path;
  if (target instanceof Map) {
    next = target.get(first);
  } else if (target instanceof Set) {
    next =
      target.size < Number(first)
        ? undefined
        : Array.from(target)[first as keyof object];
  } else if (first in target) {
    next = target[first as keyof object];
  }

  return isUndefined(next) ? null : getRecursive<T>(next, rest);
}

function set(target: object, key: string, value: unknown) {
  if (target instanceof Map) {
    target.set(key, value);

    return true;
  }

  if (target instanceof Set) {
    throw new Error(
      "The `Path.set` function does not support setting in values `Set` by key."
    );
  }

  if (typeof target === "object") {
    target[key as keyof object] = value as never;

    return true;
  }

  return false;
}

function setRecursive(target: object, path: string[], value: unknown): boolean {
  if (isNull(target) || isUndefined(target)) {
    return false;
  }

  const [first, ...rest] = path;
  if (!rest.length) {
    return set(target, first, value);
  }

  const next = getRecursive(target, [first]);
  if (next) {
    return setRecursive(next, rest, value);
  }

  const [second] = rest;
  const isNumberKey = !Number.isNaN(Number(second));
  const nextVal = isNumberKey ? new Array() : {};
  if (target instanceof Map) {
    target.set(first, nextVal);
  } else if (target instanceof Set) {
    const arr = Array.from(target);
    arr[first as keyof object] = nextVal;
  } else if (typeof target === "object") {
    (target[first as keyof object] as object) = nextVal;
  } else {
    return false;
  }

  return setRecursive(nextVal, rest, value);
}

function hasRecursive(target: object, path: string[]): boolean {
  if (!path.length) {
    return Boolean(target);
  }

  if (isNull(target) || isUndefined(target)) {
    return false;
  }

  let next = null;
  let has = true;

  const [first, ...rest] = path;
  if (target instanceof Map) {
    next = target.get(first);
    has = target.has(first);
  } else if (target instanceof Set) {
    const array = Array.from(target);
    has = first in array;
    next = array[first as keyof object];
  } else if (first in target) {
    has = first in target;
    next = target[first as keyof object];
  }

  return has && hasRecursive(next, rest);
}

abstract class Path {
  private static readonly pattern = /^([\w\d_-]+(\.{1}[\w\d_-]+)*)+$/;

  public static isValid(path: string): boolean {
    return this.pattern.test(path);
  }

  public static get<T = unknown>(target: object, path: string): T | null {
    if (!path) {
      return target as T;
    }

    if (!this.isValid(path)) {
      console.assert(false, `[px.state] Path \`${path}\` is not valid.`);

      return target as T;
    }

    return getRecursive<T>(target, path.split("."));
  }

  public static has(target: object, path: string): boolean {
    if (!this.isValid(path)) {
      console.assert(false, `[px.state] Path \`${path}\` is not valid.`);

      return false;
    }

    return hasRecursive(target, path.split("."));
  }

  public static set(target: object, path: string, value: unknown): boolean {
    if (!path) {
      return false;
    }

    if (!this.isValid(path)) {
      console.assert(false, `[px.state] Path \`${path}\` is not valid.`);

      return false;
    }

    return setRecursive(target, path.split("."), value);
  }

  public static toLodashPath(path: string): string {
    return path
      .replaceAll(/\.(\d)+/g, "[$1]")
      .replaceAll(/^(\d)+\./gm, "[$1].");
  }

  public static fromString(path: string): string[] {
    return path.split(".");
  }

  public static toString(path: string[]): string {
    return path.join(".");
  }
}

export { Path };
