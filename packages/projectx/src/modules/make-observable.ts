import type {
  ManagerInstance,
  Constructable,
  Annotated,
  GetConstructorArgs,
} from "../shared";
import { createUniqPath, isObjectOfClass } from "../shared";

import { managers } from "../components";
import {
  ArrayManager,
  DynamicObjectManager,
  ObjectManager,
} from "./components";

function registerManager<T>(manager: ManagerInstance<T>): T {
  managers.set(manager.name, manager);

  return manager.target;
}

function obsClass<T extends object | Annotated, A = T>(
  Target: Constructable<T, A>,
  ...args: GetConstructorArgs<A>
): T {
  return registerManager(
    new ObjectManager(new Target(...args), {
      path: [createUniqPath(Target.name)],
    })
  );
}

function obsObject<T extends object | Annotated>(target: T) {
  if (isObjectOfClass(target)) {
    return registerManager(
      new ObjectManager(target, {
        path: [createUniqPath(target.constructor.name)],
      })
    );
  }

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
