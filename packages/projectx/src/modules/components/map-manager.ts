import type {
  Annotation,
  ManagerInstance,
  ManagerOptions,
  MapManagerInstance,
  Path,
} from "../../shared";
import { isFunction } from "../../shared";
import { observable } from "../observable";
import ContainerManager from "./container-manager";

type PickMethods =
  | "clear"
  | "delete"
  | "entries"
  | "forEach"
  | "get"
  | "set"
  | "values";

const MapTraps = new (class {
  public clear = <K, T>(self: MapManager<K, T>) => {
    if (!self.target.size) {
      return;
    }

    const prev = self.snapshot;
    self.disposeManagers();
    self.target.clear();

    self.emit("compression", {
      current: self.target,
      prev,
    });
  };

  public delete = <K, T>(key: K, self: MapManager<K, T>) => {
    const prev = self.snapshot;
    const manager = self.values.get(key);
    if (manager) {
      manager.dispose();
      self.values.delete(key);
    }

    const result = self.target.delete(key);
    if (result) {
      self.emit("compression", {
        current: self.target,
        prev,
      });
    }

    return result;
  };

  public set = <K, T>(key: K, value: T, self: MapManager<K, T>) => {
    self.changeField(key as Path, value);

    return self.proxy;
  };

  private getMapFromValues = <K, T>(self: MapManager<K, T>) => {
    const map = new Map<K, T>();
    for (const [key, manager] of self.values) {
      map.set(key, manager.get());
    }

    return map;
  };

  public getMap = <K, T>(self: MapManager<K, T>) => {
    const map = this.getMapFromValues(self);
    if (!map.size) {
      self.reportUsage();
    }

    return map;
  };

  public forEach = <K, T>(
    callbackfn: (v: T, k: K, set: Map<K, T>) => void,
    self: MapManager<K, T>
  ) => {
    for (const [key, manager] of self.values) {
      callbackfn(manager.get(), key, self.proxy);
    }

    if (!self.values.size) {
      self.reportUsage();
    }
  };
})();

class MapManager<K, T>
  extends ContainerManager<Map<K, T>, Map<K, ManagerInstance<T>>, T>
  implements MapManagerInstance<K, T>
{
  public proxy: Map<K, T>;

  private targetMethods: Pick<Map<K, T>, PickMethods> = {
    clear: () => MapTraps.clear(this),
    delete: (key) => MapTraps.delete(key, this),
    get: (key) => this.values.get(key)?.get(),
    set: (key, value) => MapTraps.set(key, value, this),
    values: () => MapTraps.getMap(this).values(),
    entries: () => MapTraps.getMap(this).entries(),
    forEach: (callbackfn) => MapTraps.forEach(callbackfn, this),
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

  public changeField(key: Path, value: T): boolean {
    const typedKey = key as K;
    const manager = this.values.get(typedKey);
    const isSupportType = manager?.support(value);
    if (isSupportType) {
      this.target.set(typedKey, value);

      return manager!.set(value);
    }

    const prev = this.snapshot;
    this.target.set(typedKey, value);
    const newManager = observable(value, {
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
        observable(value, { path: this.joinToPath(key as Path) })
      );
    }

    return new Proxy(target, this.handlers);
  }

  public support(value: Map<K, T>): boolean {
    return value instanceof Map;
  }
}

export default MapManager;
