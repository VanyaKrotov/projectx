import type {
  Constructable,
  Target,
  Profile,
  ProviderInstance,
} from "../shared/types";

import { uid } from "../shared/uid";

class Provider<TToken extends string = string>
  implements ProviderInstance<TToken>
{
  private readonly store = new Map<Target<object, TToken>, object>();
  private readonly queue = new Map<
    Target<object, TToken>,
    Set<(t: any) => void>
  >();

  constructor(public readonly name = `Provider#${uid()}`) {}

  public register<T extends object>(target: Profile<T, TToken>): void;
  public register<T extends object>(target: Constructable<T>): void;
  public register<T extends object>(target: object): void {
    let data = target as Profile<T, TToken>;
    if (!("target" in target && "instance" in target)) {
      data = {
        target: target as Target<T, TToken>,
        instance: new (target as Constructable<T, any>)(),
      };
    }

    const instance = this.store.get(data.target);
    if (instance) {
      console.warn(
        `[projectx-di] You register one dependency multiple times. Action in the provider \`${this.name}\`.`
      );

      if (data.target !== instance) {
        throw new Error(
          `[projectx-di] A re-installed provider does not match an existing one, this may cause non-obvious code behavior! Action in the provider \`${this.name}\`.`
        );
      }
    }

    this.store.set(data.target, data.instance);

    const watchers = this.queue.get(data.target);
    if (!watchers) {
      return;
    }

    watchers.forEach((watcher) => watcher(data.instance));
    this.queue.delete(data.target);
  }

  public unregister<T extends object>(target: Target<T, TToken>): boolean {
    return this.store.delete(target) && this.queue.delete(target);
  }

  public inject<T extends object>(target: Target<T, TToken>): T | null {
    return this.store.get(target) as T;
  }

  public injectAfterCreate<T extends object>(
    target: Target<T, TToken>
  ): Promise<T> {
    return new Promise<T>((resolve) => {
      const instance = this.inject(target);
      if (instance) {
        return resolve(instance);
      }

      const watcher = (instance: T) => {
        this.queue.get(target)?.delete(watcher);

        return resolve(instance);
      };

      const queueCallbacks = this.queue.get(target);
      if (!queueCallbacks) {
        this.queue.set(target, new Set([watcher]));
      } else {
        queueCallbacks.add(watcher);
      }
    });
  }

  public dispose(): void {
    this.store.clear();
    this.queue.clear();
  }
}

export { Provider };
