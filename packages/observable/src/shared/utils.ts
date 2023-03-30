import { OBJ_PROPERTIES } from "./constants";

export function isObject<T>(target: T) {
  return target && typeof target === "object" && !Array.isArray(target);
}

export function isFunction(functionToCheck: Function) {
  return typeof functionToCheck === "function";
}

export function isGetter({ get, set }: PropertyDescriptor): boolean {
  return Boolean(get && !set);
}

export function isObjectOfClass<T>(target: T): boolean {
  return Boolean(
    target &&
      typeof target === "object" &&
      Object.getPrototypeOf(target) !== OBJ_PROPERTIES
  );
}

export function isObserveValue<T>(target: T): boolean {
  if (!target || typeof target !== "object") {
    return false;
  }

  return Boolean(Reflect.get(target as object, "_observer"));
}

export function getObserver<T>(target: T): Observer | null {
  if (!target || typeof target !== "object") {
    return null;
  }

  return Reflect.get(target as object, "_observer");
}

export function runAfterScript(fn: VoidFunction): Promise<void> {
  return Promise.resolve().then(fn);
}

export function getAllObjectFields<T extends object>(
  object: T
): Record<string, PropertyDescriptor> {
  const prototypes = Object.getPrototypeOf(object);
  if (!prototypes || prototypes === OBJ_PROPERTIES) {
    return Object.getOwnPropertyDescriptors(object);
  }

  return Object.assign(
    getAllObjectFields(prototypes),
    Object.getOwnPropertyDescriptors(prototypes),
    Object.getOwnPropertyDescriptors(object)
  );
}
