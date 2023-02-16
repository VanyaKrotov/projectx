import type {
  ContainerManagerInstance,
  ManagerInstance,
  Path,
  PropertiesInfo,
} from "./types";

import { OBJ_PROPERTIES } from "./constants";
import { uid } from "./uid";

export function isObject<T>(target: T) {
  return target && typeof target === "object" && !Array.isArray(target);
}

export function isFunction(functionToCheck: Function) {
  return typeof functionToCheck === "function";
}

export function createUniqPath(path = "Observable"): string {
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

export function isFunctionDescriptor({ value }: PropertyDescriptor): boolean {
  return isFunction(value);
}

export function isComputed({ get, set }: PropertyDescriptor) {
  return get && !set;
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

export function findManager(
  connection: Map<Path, ManagerInstance>,
  resolver: (e: ManagerInstance) => boolean
): ManagerInstance | null {
  for (const [, source] of connection) {
    if (resolver(source)) {
      return source;
    }
  }

  return null;
}

export function getManagerOf<
  T extends ManagerInstance | ContainerManagerInstance
>(manager: T | null, key: Path): ManagerInstance | null {
  if ((manager as ContainerManagerInstance)?.manager) {
    return (manager as ContainerManagerInstance).manager(key);
  }

  return null;
}

export function getKeysOfManager<
  T extends ManagerInstance | ContainerManagerInstance
>(manager: T | null): Path[] {
  if ((manager as ContainerManagerInstance)?.keys) {
    return (manager as ContainerManagerInstance).keys;
  }

  return [];
}
