import { getUniqPath, isObjectOfClass, isObject } from "../shared";

import { managers } from "../components";
import {
  ArrayManager,
  DynamicObjectManager,
  MapManager,
  ObjectManager,
  SetManager,
} from "./managers";

function registerManager<T>(manager: ContainerManagerInstance<T>): T {
  managers.set(manager.name, manager);

  return manager.source();
}

export function fromObject<T extends object>(
  target: T,
  options: Partial<FromObjectOptions<T>> = {}
) {
  if (!isObject(target)) {
    throw new Error(
      `[projectx] The type passed to \`fromObject\` function must be an object.`
    );
  }

  const source = options.saveInstance ? { ...target } : target;
  if (isObjectOfClass(target)) {
    return registerManager(
      new ObjectManager(source, {
        path: [getUniqPath(target.constructor.name)],
        annotations: options.annotations as Record<keyof T, number>,
      })
    );
  }

  return registerManager(
    new DynamicObjectManager(source, {
      path: [getUniqPath("dynamic")],
      annotations: options.annotations as Record<keyof T, number>,
    })
  );
}

export function fromArray<T>(target: Array<T>, annotation?: number): Array<T> {
  if (!Array.isArray(target)) {
    throw new Error(
      `[projectx] The type passed to \`fromArray\` function must be an array.`
    );
  }

  return registerManager(
    new ArrayManager(target, {
      annotation,
      path: [getUniqPath("array")],
    })
  );
}

export function fromMap<K, T>(
  target: Map<K, T>,
  annotation?: number
): Map<K, T> {
  if (!(target instanceof Map)) {
    throw new Error(
      `[projectx] The type passed to \`fromMap\` function must be an Map.`
    );
  }

  return registerManager(
    new MapManager(target, {
      annotation,
      path: [getUniqPath("map")],
    })
  );
}

export function fromSet<T>(target: Set<T>, annotation?: number): Set<T> {
  if (!(target instanceof Set)) {
    throw new Error(
      `[projectx] The type passed to \`fromSet\` function must be an Set.`
    );
  }

  return registerManager(
    new SetManager(target, {
      annotation,
      path: [getUniqPath("map")],
    })
  );
}
