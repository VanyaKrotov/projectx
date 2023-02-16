import { isFunction } from "../../../shared";
import { observeOf } from "../../observable";
import { ContainerManager } from "../abstraction";

import * as traps from "./map-traps";

type PickMethods =
  | "clear"
  | "delete"
  | "entries"
  | "forEach"
  | "get"
  | "set"
  | "values";

class MapManager<K, T>
  extends ContainerManager<Map<K, T>, Map<K, ManagerInstance<T>>, T>
  implements MapManagerInstance<K, T>
{
  public proxy: Map<K, T>;

  private targetMethods: Pick<Map<K, T>, PickMethods> = {
    clear: () => traps.clear(this),
    delete: (key) => traps.deleteByKey(key, this),
    get: (key) => this.values.get(key)?.get(),
    set: (key, value) => traps.set(key, value, this),
    values: () => traps.getMap(this).values(),
    entries: () => traps.getMap(this).entries(),
    forEach: (callbackfn) => traps.forEach(callbackfn, this),
  };

  private handlers: Required<Pick<ProxyHandler<Map<K, T>>, "get">> = {
    get: (_target, key) => {
      if (key in this.targetMethods) {
        return this.targetMethods[key as PickMethods];
      }

      // @ts-ignore
      const field = this.target[key];
      if (isFunction(field)) {
        return field.bind(this.proxy);
      }

      return field;
    },
  };

  constructor(target: Map<K, T>, options?: ManagerOptions) {
    super(target, new Map<K, ManagerInstance<T>>([]), options);

    this.proxy = this.define(target);
  }

  public disposeManagers(): void {
    this.values.forEach((manager) => manager.dispose());
    this.values.clear();
  }

  public manager(key: Path): ManagerInstance<any> | null {
    return this.values.get(key as K) || null;
  }

  public setValue(key: Path, value: T): boolean {
    const typedKey = key as K;
    const manager = this.values.get(typedKey);
    const isSupportType = manager?.support(value);
    if (isSupportType) {
      this.target.set(typedKey, value);

      return manager!.set(value);
    }

    const prev = this.snapshot;
    this.target.set(typedKey, value);
    const newManager = observeOf(value, {
      path: this.joinToPath(key as Path),
    });

    this.values.set(typedKey, newManager);

    if (manager) {
      newManager.receiveListeners(manager.shareListeners());
      newManager.emit("reinstall", { current: value, prev: manager.target });
    } else {
      this.emit("expansion", {
        current: this.target,
        prev,
      });
    }

    return true;
  }

  public set(value: Map<K, T>): boolean {
    const prev = this.target;
    this.target = value;

    this.proxy = this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public get snapshot(): Map<K, T> {
    return new Map<K, T>(this.target.entries());
  }

  public source(): Map<K, T> {
    return this.proxy;
  }

  public get keys(): Path[] {
    return Array.from(this.values.keys()) as Path[];
  }

  public define(target: Map<K, T>): Map<K, T> {
    this.disposeManagers();

    for (const [key, value] of target) {
      this.values.set(
        key,
        observeOf(value, { path: this.joinToPath(key as Path) })
      );
    }

    return new Proxy(target, this.handlers);
  }

  public support(value: Map<K, T>): boolean {
    return value instanceof Map;
  }
}

export default MapManager;
