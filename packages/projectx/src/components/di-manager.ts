import { Constructable } from "../shared";

interface DIManagerInstance {
  push<T extends object>(target: T): void;
  watch<T>(target: Constructable<T>, callback: (t: T) => void): void;
}

class DIManager implements DIManagerInstance {
  private readonly watchers = new Map<
    Constructable<any>,
    Array<(t: any) => unknown>
  >();

  public push<T extends object>(target: T): void {
    const Source = target.constructor as Constructable<T>;
    const watchers = this.watchers.get(Source);
    if (!watchers) {
      return;
    }

    watchers.forEach((callback) => callback(target));
    this.watchers.delete(Source);
  }

  public watch<T>(target: Constructable<T, T>, callback: (t: T) => void): void {
    const watchers = this.watchers.get(target);
    if (watchers) {
      watchers.push(callback);

      return;
    }

    this.watchers.set(target, [callback]);
  }
}

export default DIManager;
