import { isFunction } from "../../../shared";

import { observeOf } from "../../observe-of";
import { ContainerManager } from "../abstraction";
import * as traps from "./set-traps";

type PickMethods =
  | "clear"
  | "delete"
  | "entries"
  | "forEach"
  | "add"
  | "values";

class SetManager<T>
  extends ContainerManager<Set<T>, Set<ManagerInstance<T>>>
  implements SetManagerInstance<T>
{
  public proxy: Set<T>;

  private targetMethods: Pick<Set<T>, PickMethods> = {
    clear: () => traps.clear(this),
    delete: (value) => traps.deleteValue(value, this),
    add: (value) => traps.add(value, this),
    values: () => traps.getSet(this).values(),
    entries: () => traps.getSet(this).entries(),
    forEach: (callbackfn) => traps.forEach(callbackfn, this),
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
    this.instanceCreated(this.proxy);
  }

  public setValue(key: Path, value: Set<T>): boolean {
    return true;
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
      this.values.add(observeOf(value, { path: this.joinToPath(index) }));
      index++;
    }

    return new Proxy(target, this.handlers);
  }

  public support(value: Set<T>): boolean {
    return value instanceof Set;
  }
}

export default SetManager;
