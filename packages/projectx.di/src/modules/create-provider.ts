import type { Constructable, Target, Provider } from "../shared/types";

import { uid } from "../shared/uid";

function createProvider(providerName: string = `Provider#${uid()}`) {
  const store = new Map<Target, object>();
  const queue = new Map<Target, Set<(t: any) => void>>();

  const register = <T extends object>(
    provider: Constructable<T> | Provider<T>
  ) => {
    let data = provider as Provider<T>;
    if (!("target" in provider) || !("instance" in provider)) {
      data = {
        target: provider,
        instance: new provider(...([] as never)),
      };
    }

    const instance = store.get(data.target);
    if (instance) {
      console.warn(
        `[projectx-di] You register one dependency multiple times. Action in the provider \`${providerName}\`.`
      );

      if (data.target !== instance) {
        throw new Error(
          `[projectx-di] A re-installed provider does not match an existing one, this may cause non-obvious code behavior! Action in the provider \`${providerName}\`.`
        );
      }
    }

    store.set(data.target, data.instance);

    const watchers = queue.get(data.target);
    if (!watchers) {
      return;
    }

    watchers.forEach((watcher) => watcher(data.instance));
    queue.delete(data.target);
  };

  const unregister = <T extends object>(target: Target<T>): boolean => {
    return store.delete(target) && queue.delete(target);
  };

  const injectSync = <T extends object>(target: Target<T>): T | null => {
    if (!store.has(target)) {
      return null;
    }

    return store.get(target) as T;
  };

  const injectAsync = <T extends object>(target: Target<T>): Promise<T> => {
    return new Promise<T>((resolve) => {
      const instance = injectSync(target);
      if (instance) {
        return resolve(instance);
      }

      const watcher = (instance: T) => {
        queue.get(target)?.delete(watcher);

        return resolve(instance);
      };

      const queueCallbacks = queue.get(target);
      if (!queueCallbacks) {
        queue.set(target, new Set([watcher]));
      } else {
        queueCallbacks.add(watcher);
      }
    });
  };

  return {
    register,
    unregister,
    injectSync,
    injectAsync,
  };
}

export { createProvider };
