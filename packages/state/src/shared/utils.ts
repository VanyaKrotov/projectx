import { EqualResolver } from "./types";

export const defaultEqualResolver: EqualResolver<unknown> = (a, b) => a === b;

export function isNull(target: unknown): boolean {
  return target === null;
}

export function isUndefined(target: unknown): boolean {
  return target === undefined;
}
