import type {
  Constructable,
  Annotated,
  GetConstructorArgs,
  ContainerManagerInstance,
} from "../shared";
import { createUniqPath, isObjectOfClass, isObject } from "../shared";

import { managers } from "../components";
import {
  ArrayManager,
  DynamicObjectManager,
  MapManager,
  ObjectManager,
  SetManager,
} from "./components";

function registerManager<T>(manager: ContainerManagerInstance<T>): T {
  managers.set(manager.name, manager);

  return manager.source();
}

export function fromClass<T extends object | Annotated, A = T>(
  Target: Constructable<T, A>,
  ...args: GetConstructorArgs<A>
): T {
  return registerManager(
    new ObjectManager(new Target(...args), {
      path: [createUniqPath(Target.name)],
    })
  );
}

export function fromObject<T extends object | Annotated>(target: T) {
  if (!isObject(target)) {
    throw new Error(
      `[projectx] The type passed to \`fromObject\` function must be an object.`
    );
  }

  if (isObjectOfClass(target)) {
    return registerManager(
      new ObjectManager(target, {
        path: [createUniqPath(target.constructor.name)],
      })
    );
  }

  return registerManager(new DynamicObjectManager(target));
}

export function fromArray<T>(target: Array<T>): Array<T> {
  if (!Array.isArray(target)) {
    throw new Error(
      `[projectx] The type passed to \`fromArray\` function must be an array.`
    );
  }

  return registerManager(new ArrayManager(target));
}

export function fromMap<K, T>(target: Map<K, T>): Map<K, T> {
  if (!(target instanceof Map)) {
    throw new Error(
      `[projectx] The type passed to \`fromMap\` function must be an Map.`
    );
  }

  return registerManager(new MapManager(target));
}

export function fromSet<T>(target: Set<T>): Set<T> {
  if (!(target instanceof Set)) {
    throw new Error(
      `[projectx] The type passed to \`fromSet\` function must be an Set.`
    );
  }

  return registerManager(new SetManager(target));
}
