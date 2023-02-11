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
  return registerManager(new ArrayManager(target));
}
