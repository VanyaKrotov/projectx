import {
  isComputed,
  isFunction,
  ManagerInstance,
  ManagerOptions,
} from "../shared";
import { isObject, isObjectOfClass } from "../shared";

import {
  ArrayManager,
  ComputedManager,
  DynamicObjectManager,
  ObjectManager,
  ValueManager,
} from "./components";

export function observable<T>(
  target: T,
  options: ManagerOptions,
  description: PropertyDescriptor = {}
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

  if (isComputed(description)) {
    return new ComputedManager(target, options);
  }

  // if (target instanceof Set) {
  //   return target;
  // }

  // if (target instanceof Map) {
  //   return target;
  // }

  return new ValueManager(target, options);
}
