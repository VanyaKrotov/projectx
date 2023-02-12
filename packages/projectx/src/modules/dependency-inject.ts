import type { AsyncInjector, Constructable } from "../shared";
import { findManager } from "../shared";

import { diManager, managers } from "../components";

const inject = <T>(target: Constructable<T, T>): T | null => {
  const manager = findManager(
    managers,
    (manager) => manager.target instanceof target
  );

  return manager && manager.source();
};

const asyncInjector = async <T>(target: Constructable<T, T>) =>
  inject(target) ||
  new Promise<T>((resolve) => diManager.watch(target, (t: T) => resolve(t)));

abstract class DependencyInjector {
  constructor() {
    this.inject(asyncInjector);
  }

  protected abstract inject(asyncInject: AsyncInjector): void;
}

export { DependencyInjector, inject };
