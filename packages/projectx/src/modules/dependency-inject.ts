import { Constructable, GetConstructorArgs } from "../shared/types";

import { managers } from "./initialize";

function dependencyInject<T>(
  Target: Constructable<T, T>,
  ...args: GetConstructorArgs<T>
): T {
  for (const [, source] of managers) {
    if (source.target instanceof Target) {
      return source.target;
    }
  }

  return new Target(...args);
}

export { dependencyInject };
