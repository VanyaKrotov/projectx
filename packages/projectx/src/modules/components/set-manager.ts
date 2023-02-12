import type {
  ManagerInstance,
  ManagerOptions,
  Path,
  SetManagerInstance,
} from "../../shared";
import { isFunction } from "../../shared";

import { observable } from "../observable";
import ContainerManager from "./container-manager";

type PickMethods =
  | "clear"
  | "delete"
  | "entries"
  | "forEach"
  | "add"
  | "values";

const SetTraps = new (class {
  public clear<T>(self: SetManager<T>) {
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
  }

  public delete = <T>(value: T, self: SetManager<T>): boolean => {
    const prev = self.snapshot;
    const manager = self.getByValue(value);
    if (manager) {
      manager.dispose();
      self.values.delete(manager);
    }

    const result = self.target.delete(value);
    if (result) {
      self.emit("compression", {
        current: self.target,
        prev,
      });
    }

    return result;
  };

  public add = <T>(value: T, self: SetManager<T>) => {
    const manager = self.getByValue(value);
    if (manager) {
      return self.proxy;
    }

    const prev = self.snapshot;
    self.values.add(
      observable(value, { path: self.joinToPath(self.target.size) })
    );
    self.target.add(value);

    self.emit("expansion", { current: self.target, prev });

    return self.proxy;
  };

  private getSetFromValues = <T>(self: SetManager<T>): Set<T> => {
    const set = new Set<T>();
    for (const manager of self.values) {
      set.add(manager.get());
    }

    return set;
  };

  public getSet = <T>(self: SetManager<T>) => {
    const set = this.getSetFromValues(self);
    if (!set.size) {
      self.reportUsage();
    }

    return set;
  };

  public forEach = <T>(
    callbackfn: (v: T, k: T, set: Set<T>) => void,
    self: SetManager<T>
  ) => {
    for (const manager of self.values) {
      const value = manager.get();
      callbackfn(value, value, self.proxy);
    }

    if (!self.values.size) {
      self.reportUsage();
    }
  };
})();

class SetManager<T>
  extends ContainerManager<Set<T>, Set<ManagerInstance<T>>>
  implements SetManagerInstance<T>
{
  public proxy: Set<T>;

  private targetMethods: Pick<Set<T>, PickMethods> = {
    clear: () => SetTraps.clear(this),
    delete: (value) => SetTraps.delete(value, this),
    add: (value) => SetTraps.add(value, this),
    values: () => SetTraps.getSet(this).values(),
    entries: () => SetTraps.getSet(this).entries(),
    forEach: (callbackfn) => SetTraps.forEach(callbackfn, this),
  };

  private handlers: Required<Pick<ProxyHandler<Set<T>>, "get">> = {
    get: (_target, key) => {
      if (key in this.targetMethods) {
        return this.targetMethods[key as PickMethods];
      }

      // @ts-ignore
      const field = this.target[key];
      if (isFunction(field)) {
        return field.bind(this.target);
      }

      return field;
    },
  };

  constructor(target: Set<T>, options?: ManagerOptions) {
    super(target, new Set<ManagerInstance<T>>([]), options);

    this.proxy = this.define(target);
  }

  public getByIndex(index: number): ManagerInstance<T> | null {
    if (index >= this.target.size) {
      return null;
    }

    let i = 0;
    for (const manager of this.values) {
      if (i === index) {
        return manager;
      }

      i++;
    }

    return null;
  }

  public getByValue(value: T): ManagerInstance<T> | null {
    for (const manager of this.values) {
      if (value === manager.target) {
        return manager;
      }
    }

    return null;
  }

  public disposeManagers(): void {
    this.values.forEach((manager) => manager.dispose());
    this.values.clear();
  }

  public manager(key: Path): ManagerInstance<any> | null {
    return this.getByIndex(key as number);
  }

  public set(value: Set<T>): boolean {
    const prev = this.target;
    this.target = value;

    this.proxy = this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public get snapshot(): Set<T> {
    return new Set<T>(this.target.values());
  }

  public source(): Set<T> {
    return this.proxy;
  }

  public get keys(): Path[] {
    const index: Path[] = [];
    this.target.forEach(() => {
      index.push(index.length);
    });

    return index;
  }

  public define(target: Set<T>): Set<T> {
    this.disposeManagers();

    let index = 0;
    for (const value of target) {
      this.values.add(observable(value, { path: this.joinToPath(index) }));
      index++;
    }

    return new Proxy(target, this.handlers);
  }
}

export default SetManager;
