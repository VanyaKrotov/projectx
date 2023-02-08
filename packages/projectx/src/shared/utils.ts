import { nanoid } from "nanoid";

export function isObject<T>(target: T) {
  return target && typeof target === "object" && !Array.isArray(target);
}

export function isPrimitive<T>(target: T) {
  return !isObject(target) && !Array.isArray(target);
}

export function isClass<T>(v: T) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString());
}

export function isFunction(functionToCheck: Function) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
  );
}

export function getProperties<T extends object>(target: T): string[] {
  return Object.keys(target).filter((key) => !isFunction((target as any)[key]));
}

export function createPrivateProp<T>(
  target: T,
  key: string | symbol,
  value: unknown
) {
  Object.defineProperty(target, key, {
    enumerable: false,
    writable: false,
    configurable: false,
    value,
  });
}

export function createEventUId(objectId: string, key: string | symbol): string {
  return `${objectId}#${key.toString()}`;
}

export function createUniqPath(path = "ObservableState"): string {
  return `${path}$${nanoid(4)}`;
}

export function runAfterScript(fn: VoidFunction): Promise<void> {
  return Promise.resolve().then(fn);
}

export function getGetters<T extends object>(
  obj: T,
  ignoredKeys: string[] = []
): Record<string, PropertyDescriptor> {
  const descriptions = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(obj)
  );
  const result: Record<string, PropertyDescriptor> = {};
  for (const key in descriptions) {
    const description = descriptions[key];
    if (
      !description.writable &&
      description.get &&
      !description.set &&
      !ignoredKeys.includes(key)
    ) {
      result[key] = description;
    }
  }

  return result;
}

export function isEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((key) => arr2.indexOf(key) !== -1);
}
