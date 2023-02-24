import { EqualResolver } from "./types";

export const defaultEqualResolver: EqualResolver<unknown> = (a, b) => a === b;

export function isNull(target: unknown): boolean {
  return target === null;
}

export function isUndefined(target: unknown): boolean {
  return target === undefined;
}

export function isEmptyObject<T extends object>(obj: T): boolean {
  for (const _key in obj) {
    return false;
  }

  return true;
}
