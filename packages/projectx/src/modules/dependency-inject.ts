import { Constructable, findManager, GetConstructorArgs } from "../shared";

import { managers } from "../components";

function dependencyInject<T>(
  Target: Constructable<T, T>,
  ...args: GetConstructorArgs<T>
): T {
  const manager = findManager(
    managers,
    (manager) => manager.target instanceof Target
  );
  if (!manager) {
    return new Target(...args);
  }

  return manager.target;
}

export { dependencyInject };
