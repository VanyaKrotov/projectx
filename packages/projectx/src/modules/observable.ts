import { isObject } from "../shared/utils";
import type { ManagerInstance, ManagerOptions } from "../shared/types";

import { ArrayManager, ObjectManager, ValueManager } from "./components";

export function observable<T extends object>(
  target: T,
  options: ManagerOptions
): ManagerInstance<T>;

export function observable<T>(
  target: Array<T>,
  options: ManagerOptions
): ManagerInstance<T>;

export function observable<T>(
  target: T,
  options: ManagerOptions
): ManagerInstance<T>;

export function observable<T>(target: T, options: ManagerOptions) {
  if (Array.isArray(target)) {
    return new ArrayManager(target, options);
  }

  if (isObject(target)) {
    return new ObjectManager(target as object, options);
  }

  if (target instanceof Set) {
    return target;
  }

  if (target instanceof Map) {
    return target;
  }

  return new ValueManager(target, options);
}
