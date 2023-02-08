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

// TODO
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
