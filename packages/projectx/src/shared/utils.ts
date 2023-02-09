import { FieldType, PropertiesInfo } from "./types";
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

function isComputed({ get, set }: PropertyDescriptor) {
  return get && !set;
}

function getAllProperties<T extends object>(
  object: T
): Record<string, PropertyDescriptor> {
  const prototypes = Object.getPrototypeOf(object);
  if (!prototypes) {
    return Object.getOwnPropertyDescriptors(object);
  }

  return Object.assign(
    getAllProperties(prototypes),
    Object.getOwnPropertyDescriptors(prototypes),
    Object.getOwnPropertyDescriptors(object)
  );
}

const filterNativePrototypes = (
  prototypes: Record<string, PropertyDescriptor>
): Record<string, PropertyDescriptor> => {
  const objPrototypes = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf({})
  );
  const result: Record<string, PropertyDescriptor> = {};
  for (const key in prototypes) {
    if (!(key in objPrototypes)) {
      result[key] = prototypes[key];
    }
  }

  return result;
};

function isFunctionDesc({ value }: PropertyDescriptor): boolean {
  return isFunction(value);
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

export function getFieldsOfObject<T extends object>(object: T): PropertiesInfo {
  const properties = getAllProperties(object);

  return filterNativePrototypes(properties);
}

export function isEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((key) => arr2.indexOf(key) !== -1);
}
