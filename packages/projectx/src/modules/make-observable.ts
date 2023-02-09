import type {
  ManagerInstance,
  Constructable,
  Annotated,
} from "../shared/types";
import { createUniqPath } from "../shared/utils";

import { managers } from "./initialize";
import {
  ArrayManager,
  DynamicObjectManager,
  ObjectManager,
} from "./components";

function registerManager<T>(manager: ManagerInstance<T>): T {
  managers.set(manager.name, manager);

  return manager.value;
}

function obsClass<T extends object | Annotated>(
  Target: Constructable<T>,
  ...args: unknown[]
): T {
  return registerManager(
    new ObjectManager(new Target(...args), {
      path: [createUniqPath(Target.name)],
    })
  );
}

function obsObject<T extends object | Annotated>(target: T) {
  return registerManager(new DynamicObjectManager(target));
}

function obsArray<T>(target: Array<T>): Array<T> {
  return registerManager(new ArrayManager(target));
}

export const observable = {
  object: obsObject,
  class: obsClass,
  array: obsArray,
  map: <K, T>(target: Map<K, T>) => target,
  set: <T>(target: Set<T>) => target,
};
