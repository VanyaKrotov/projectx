import rootManager from "./root-manager";

import type { ManagerInstance, Constructable, Annotated } from "shared/types";
import { createUniqPath } from "shared/utils";

import { ArrayManager, ObjectManager } from "./components";

function observableValue<T>(manager: ManagerInstance<T>): T {
  rootManager.addManager(manager);

  return manager.value;
}

console.log(rootManager);

export const observable = {
  object: <T extends object | Annotated>(target: T) =>
    observableValue(new ObjectManager(target, { path: [createUniqPath()] })),
  class: <T extends object | Annotated>(Target: Constructable<T>): T =>
    observableValue(
      new ObjectManager(new Target(), { path: [createUniqPath(Target.name)] })
    ),
  array: <T>(target: Array<T>) =>
    new ArrayManager(target, { path: [createUniqPath()] }),
  map: <K, T>(target: Map<K, T>) => target,
  set: <T>(target: Set<T>) => target,
};
