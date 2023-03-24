import { isNull, isUndefined } from "../shared";

function getRecursive<T>(target: object, path: string[]): T | null {
  if (!path.length) {
    return target as T;
  }

  if (isNull(target) || isUndefined(target)) {
    return null;
  }

  if (typeof target === "object") {
    const [first, ...rest] = path;
    for (const key in target) {
      if (first == key) {
        return getRecursive<T>(target[key as keyof object], rest);
      }
    }
  }

  return null;
}

function setRecursive(target: object, path: string[], value: unknown): boolean {
  if (!path.length) {
    return false;
  }

  if (isNull(target) || isUndefined(target) || typeof target !== "object") {
    return false;
  }

  const [first, ...rest] = path;
  for (const key in target) {
    if (first !== key) {
      continue;
    }

    if (!rest.length) {
      (target[key as keyof object] as unknown) = value;

      return true;
    }

    return setRecursive(target[key as keyof object] as object, rest, value);
  }

  return false;
}

function hasRecursive(target: object, path: string[]): boolean {
  if (!path.length) {
    return Boolean(target);
  }

  if (isNull(target) || isUndefined(target) || typeof target !== "object") {
    return false;
  }

  const [first, ...rest] = path;
  if (first in target) {
    return hasRecursive(target[first as keyof object], rest);
  }

  return false;
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
