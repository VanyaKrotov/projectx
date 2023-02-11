import type {
  ArrayManagerInstance,
  ManagerInstance,
  ManagerOptions,
} from "../../shared";
import { isFunction, ANNOTATIONS } from "../../shared";

import { observable } from "../observable";
import ContainerManager from "./container-manager";

class ArrayManager<T>
  extends ContainerManager<Array<T>, Array<ManagerInstance<T>>>
  implements ArrayManagerInstance<Array<T>, Array<ManagerInstance<T>>>
{
  public annotation = ANNOTATIONS.array;

  private proxy: Array<T>;

  constructor(target: Array<T>, options?: Omit<ManagerOptions, "annotation">) {
    super(target, [], options);

    this.proxy = this.define(target);
  }

  private handlers: Required<
    Pick<ProxyHandler<Array<T>>, "deleteProperty" | "get" | "set">
  > = {
    get: (_target, key) => {
      const index = Number(key);
      if (!Number.isNaN(index)) {
        return this.values[index]?.get();
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
        if (index in this.values) {
          return this.values[index].set(value);
        }

        try {
          this.values[index] = observable(value, {
            path: this.joinToPath(key),
          });
          this.target[index] = value;

          this.emit("expansion", { current: this.target });

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

      const manager = this.values[index];
      const deleteResult = this.target.splice(index, 1).length === 1;
      if (deleteResult) {
        if (manager) {
          this.values.splice(index, 1);
          manager.dispose();
        }
      }

      return deleteResult;
    },
  };

  public set(value: Array<T>): boolean {
    const prev = this.target;

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

  public source(): T[] {
    return this.proxy;
  }

  public manager(key: string): ManagerInstance | null {
    return this.values[Number(key)];
  }

  public disposeManagers() {
    this.values.forEach((manager) => manager.dispose());

    this.values = [];
  }

  private define(target: Array<T>): Array<T> {
    this.disposeManagers();

    for (let i = 0; i < target.length; i++) {
      this.values.push(
        observable<T>(target[i], {
          path: this.joinToPath(i),
        })
      );
    }

    return new Proxy(target, this.handlers);
  }
}

export default ArrayManager;
