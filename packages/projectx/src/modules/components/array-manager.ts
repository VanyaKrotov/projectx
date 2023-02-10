import {
  ArrayAnnotation,
  ManagerInstance,
  ManagerOptions,
  RequiredManagerInstance,
} from "../../shared/types";
import { isFunction } from "../../shared/utils";
import { ANNOTATIONS } from "../../shared/constants";

import { observable } from "../observable";

import Manager from "./manager";

class ArrayManager<T>
  extends Manager<Array<T>, ArrayAnnotation, Array<ManagerInstance<T>>>
  implements RequiredManagerInstance<Array<T>>
{
  public managers: Array<ManagerInstance> = [];

  private proxy: Array<T>;

  constructor(public target: Array<T>, options?: ManagerOptions) {
    super(options, ANNOTATIONS.array);

    this.proxy = this.define(target);

    this.emit("define", { current: this.value });
  }

  private handlers: Required<
    Pick<ProxyHandler<Array<T>>, "deleteProperty" | "get" | "set">
  > = {
    get: (_target, key) => {
      const index = Number(key);
      if (!Number.isNaN(index)) {
        return this.managers[index]?.value;
      }

      const value = this.target[key as keyof Array<T>];
      if (isFunction(value as never)) {
        return (...args: never[]) =>
          (value as Function).call(this.proxy, ...args);
      }

      return value;
    },
    set: (_target, key, value) => {
      const index = Number(key);
      if (!Number.isNaN(index)) {
        if (index in this.managers) {
          return this.managers[index].set(value);
        }

        try {
          this.managers[index] = observable(value, {
            path: this.joinToPath(key),
          });
          this.target[index] = value;

          this.emit("add", { current: this.value });

          return true;
        } catch {
          return false;
        }
      }

      this.target[key as keyof Array<T>] = value;

      return true;
    },
    deleteProperty: (_target, key) => {
      const index = Number(key);
      if (Number.isNaN(index)) {
        return false;
      }

      if (!(index in this.target)) {
        return false;
      }

      const manager = this.managers[index];
      const deleteResult = this.target.splice(index, 1).length === 1;
      if (deleteResult) {
        if (manager) {
          this.managers.splice(index, 1);
          manager.dispose();
        }
      }

      return deleteResult;
    },
  };

  public set(value: Array<T>): boolean {
    const prev = this.value;

    this.target = value;
    this.proxy = this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public get snapshot(): Array<T> {
    return [...this.target];
  }

  public get keys(): string[] {
    const result = [];
    for (const index in this.target) {
      result.push(index);
    }

    return result;
  }

  public get value(): Array<T> {
    this.reportUsage();

    return this.proxy;
  }

  public manager(key: string | symbol): ManagerInstance | null {
    return this.managers[Number(key)];
  }

  public disposeManagers() {
    for (const manager of this.managers) {
      manager.dispose();
    }

    this.managers = [];
  }

  private define(target: Array<T>): Array<T> {
    this.disposeManagers();

    for (const item of target) {
      this.managers.push(
        observable<T>(item, {
          path: this.joinToPath(String(this.managers.length)),
        })
      );
    }

    return new Proxy(target, this.handlers);
  }
}

export default ArrayManager;
