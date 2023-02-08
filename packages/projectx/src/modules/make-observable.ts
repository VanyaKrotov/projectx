import type { ManagerInstance, Constructable, Annotated } from "../shared/types";
import { createUniqPath } from "../shared/utils";

import { managers } from "./initialize";
import { ArrayManager, ObjectManager } from "./components";

function register<T>(manager: ManagerInstance<T>): T {
  managers.set(manager.name, manager);

  return manager.value;
}

export const observable = {
  object: <T extends object | Annotated>(target: T) =>
    register(new ObjectManager(target, { path: [createUniqPath()] })),
  class: <T extends object | Annotated>(Target: Constructable<T>): T =>
    register(
      new ObjectManager(new Target(), { path: [createUniqPath(Target.name)] })
    ),
  array: <T>(target: Array<T>) =>
    new ArrayManager(target, { path: [createUniqPath()] }),
  map: <K, T>(target: Map<K, T>) => target,
  set: <T>(target: Set<T>) => target,
};
