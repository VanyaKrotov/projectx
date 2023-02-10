import { isObject, isObjectOfClass } from "../shared/utils";
import type { ManagerInstance, ManagerOptions } from "../shared/types";

import {
  ArrayManager,
  DynamicObjectManager,
  ObjectManager,
  ValueManager,
} from "./components";

export function observable<T>(
  target: T,
  options: ManagerOptions
): ManagerInstance {
  if (Array.isArray(target)) {
    return new ArrayManager(target, options);
  }

  if (isObjectOfClass(target)) {
    return new ObjectManager(target as object, options);
  }

  if (isObject(target)) {
    return new DynamicObjectManager(target as object, options);
  }

  // if (target instanceof Set) {
  //   return target;
  // }

  // if (target instanceof Map) {
  //   return target;
  // }

  return new ValueManager(target, options);
}
