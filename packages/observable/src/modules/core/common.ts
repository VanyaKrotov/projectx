import { isObject, isObserveValue } from "../../shared";

import { makeObservableArray } from "./array";
import { makeObservableMap } from "./map";
import { makeObservableObject } from "./object";
import { makeObservableSet } from "./set";

function makeObservable<T>(target: T, parent?: Observer): T;

function makeObservable<T>(target: Array<T>, parent?: Observer): Array<T>;

function makeObservable<T extends object>(target: T, parent?: Observer): T;

function makeObservable<K, V>(target: Map<K, V>, parent?: Observer): Map<K, V>;

function makeObservable<T>(target: Set<T>, parent?: Observer): Set<T>;

function makeObservable(target: unknown, parent?: Observer): unknown {
  if (isObserveValue(target)) {
    return target;
  }

  if (target instanceof Map) {
    return makeObservableMap(target, parent);
  }

  if (target instanceof Set) {
    return makeObservableSet(target, parent);
  }

  if (Array.isArray(target)) {
    return makeObservableArray(target, parent);
  }

  if (isObject(target)) {
    return makeObservableObject(target as object, parent);
  }

  return target;
}

export { makeObservable };
