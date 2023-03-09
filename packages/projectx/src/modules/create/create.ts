import { isObject, isObserveValue, Properties } from "../../shared";

import { createFromArray } from "./from-array";
import { createFromMap } from "./from-map";
import { createFromObject } from "./from-object";
import { createFromSet } from "./from-set";

function create<T>(
  target: T,
  schema?: Schema | Properties,
  parent?: Observer
): T;

function create<T>(
  target: Array<T>,
  schema?: Schema | Properties,
  parent?: Observer
): Array<T>;

function create<T extends object>(
  target: T,
  schema?: Schema | Properties,
  parent?: Observer
): T;

function create<K, V>(
  target: Map<K, V>,
  schema?: Schema | Properties,
  parent?: Observer
): Map<K, V>;

function create<T>(
  target: Set<T>,
  schema?: Schema | Properties,
  parent?: Observer
): Set<T>;

function create(
  target: unknown,
  schema?: Schema | Properties,
  parent?: Observer
): unknown {
  if (isObserveValue(target)) {
    return target;
  }

  if (target instanceof Map) {
    return createFromMap(target, parent, schema);
  }

  if (target instanceof Set) {
    return createFromSet(target, parent, schema);
  }

  if (Array.isArray(target)) {
    return createFromArray(target, parent, schema);
  }

  if (isObject(target)) {
    return createFromObject(target as object, parent, schema);
  }

  return target;
}

export { create };
