import type { FieldType, PropertiesInfo } from "./types";

import { OBJ_PROPERTIES } from "./constants";
import { uid } from "./uid";

export function isObject<T>(target: T) {
  return target && typeof target === "object" && !Array.isArray(target);
}

export function isFunction(functionToCheck: Function) {
  return typeof functionToCheck === "function";
}

export function createUniqPath(path = "ObservableState"): string {
  return `${path}#${uid()}`;
}

export function runAfterScript(fn: VoidFunction): Promise<void> {
  return Promise.resolve().then(fn);
}

export function getFieldsOfObject<T extends object>(object: T): PropertiesInfo {
  const prototypes = Object.getPrototypeOf(object);
  if (!prototypes || prototypes === OBJ_PROPERTIES) {
    return Object.getOwnPropertyDescriptors(object);
  }

  return Object.assign(
    getFieldsOfObject(prototypes),
    Object.getOwnPropertyDescriptors(prototypes),
    Object.getOwnPropertyDescriptors(object)
  );
}

function isFunctionDesc({ value }: PropertyDescriptor): boolean {
  return isFunction(value);
}

function isComputed({ get, set }: PropertyDescriptor) {
  return get && !set;
}

export function getFieldType(description: PropertyDescriptor): FieldType {
  if (isComputed(description)) {
    return "computed";
  }

  if (isFunctionDesc(description)) {
    return "action";
  }

  return "property";
}

export function isEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((key) => arr2.indexOf(key) !== -1);
}

export function isObjectOfClass<T>(target: T): boolean {
  return Boolean(
    target &&
      typeof target === "object" &&
      Object.getPrototypeOf(target) !== OBJ_PROPERTIES
  );
}
