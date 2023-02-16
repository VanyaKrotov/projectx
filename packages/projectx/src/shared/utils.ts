import { OBJ_PROPERTIES, SERVICE_FIELD_NAME } from "./constants";
import { uid } from "./uid";

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

export function isObserveValue<T>(target: T): boolean {
  return isObject(target) && SERVICE_FIELD_NAME in (target as object);
}

export function getUniqPath(path = ""): string {
  return `${path}#${uid()}`;
}

export function runAfterScript(fn: VoidFunction): Promise<void> {
  return Promise.resolve().then(fn);
}

export function getAllObjectFields<T extends object>(
  object: T
): PropertiesInfo {
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
