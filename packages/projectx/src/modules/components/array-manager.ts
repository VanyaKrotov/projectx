import type {
  Annotation,
  ArrayManagerInstance,
  ManagerInstance,
  ManagerOptions,
  Path,
} from "../../shared";
import { isFunction, ANNOTATIONS } from "../../shared";

import { observable } from "../observable";
import ContainerManager from "./container-manager";

const ArrayTraps = new (class {
  public get = <T>(key: Path, self: ArrayManager<T>) => {
    const index = Number(key);
    if (!Number.isNaN(index)) {
      return self.values[index]?.get();
    }

    const value = self.target[key as keyof Array<T>];
    if (isFunction(value as never)) {
      return (...args: never[]) =>
        (value as Function).call(self.proxy, ...args);
    }

    return value;
  };

  public set = <T>(key: Path, value: T, self: ArrayManager<T>): boolean => {
    const index = Number(key);
    if (!Number.isNaN(index)) {
      return self.changeField(index, value);
    }

    self.target[key as number] = value;

    return true;
  };

  public deleteProperty = <T>(key: Path, self: ArrayManager<T>): boolean => {
    const index = Number(key);
    if (Number.isNaN(index)) {
      return false;
    }

    if (!(index in self.target)) {
      return false;
    }

    const manager = self.values[index];
    const deleteResult = self.target.splice(index, 1).length === 1;
    if (deleteResult) {
      if (manager) {
        self.values.splice(index, 1);
        manager.dispose();
      }
    }

    return deleteResult;
  };
})();

class ArrayManager<T>
  extends ContainerManager<Array<T>, Array<ManagerInstance<T>>, T>
  implements ArrayManagerInstance<Array<T>, Array<ManagerInstance<T>>>
{
  public annotation = ANNOTATIONS.array;

  public proxy: Array<T>;

  constructor(target: Array<T>, options?: Omit<ManagerOptions, "annotation">) {
    super(target, [], options);

    this.proxy = this.define(target);
  }

  private handlers: Required<
    Pick<ProxyHandler<Array<T>>, "deleteProperty" | "get" | "set">
  > = {
    get: (_target, key) => ArrayTraps.get(key, this),
    set: (_target, key, value) => ArrayTraps.set(key, value, this),
    deleteProperty: (_target, key) => ArrayTraps.deleteProperty(key, this),
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

  public changeField(key: Path, value: T): boolean {
    const index = key as number;
    const manager = this.values[index];
    if (manager?.support(value)) {
      return this.values[index].set(value);
    }

    this.values[index] = observable(value, {
      path: this.joinToPath(key),
    });
    this.target[index] = value;

    if (manager) {
      this.values[index].receiveListeners(manager.shareListeners());
      this.values[index].emit("reinstall", {
        prev: manager.target,
        current: value,
      });
    } else {
      this.emit("expansion", {
        current: this.target,
      });
    }

    return true;
  }

  public get snapshot(): Array<T> {
    return [...this.target];
  }

  public get keys(): Path[] {
    const result = [];
    for (const index in this.target) {
      result.push(Number(index));
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

  public support(value: T[]): boolean {
    return Array.isArray(value);
  }
}

export default ArrayManager;
