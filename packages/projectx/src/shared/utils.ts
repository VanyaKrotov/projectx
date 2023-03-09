import { OBJ_PROPERTIES, SERVICE_FIELD_NAME } from "./constants";

export function isObject<T>(target: T) {
  return target && typeof target === "object" && !Array.isArray(target);
}

export function isFunction(functionToCheck: Function) {
  return typeof functionToCheck === "function";
}

export function isFunctionDescriptor({ value }: PropertyDescriptor): boolean {
  return isFunction(value);
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
  return isObject(target) && Reflect.get(target as object, SERVICE_FIELD_NAME);
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

export function defineServiceProperty<T extends object, V>(
  target: T,
  value: V
): T {
  if (SERVICE_FIELD_NAME in target) {
    return target;
  }

  return Object.defineProperty(target, SERVICE_FIELD_NAME, {
    value,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export function deleteServiceProperty<T extends object>(target: T): boolean {
  // @ts-ignore
  return delete target[SERVICE_FIELD_NAME];
}
