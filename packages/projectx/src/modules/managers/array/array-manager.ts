import { observeOf } from "../../observe-of";
import { ContainerManager } from "../abstraction";
import * as traps from "./array-traps";

class ArrayManager<T>
  extends ContainerManager<Array<T>, Array<ManagerInstance<T>>, T>
  implements ArrayManagerInstance<Array<T>, Array<ManagerInstance<T>>>
{
  public proxy: Array<T>;

  constructor(target: Array<T>, options?: ManagerOptions) {
    super(target, [], options);

    this.proxy = this.define(target);

    this.instanceCreated(this.proxy);
  }

  private handlers: Required<
    Pick<ProxyHandler<Array<T>>, "deleteProperty" | "get" | "set">
  > = {
    get: (_target, key) => traps.get(key, this),
    set: (_target, key, value) => traps.set(key, value, this),
    deleteProperty: (_target, key) => traps.deleteProperty(key, this),
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

  public setValue(key: Path, value: T): boolean {
    const index = key as number;
    const manager = this.values[index];
    if (manager?.support(value)) {
      return this.values[index].set(value);
    }

    this.values[index] = observeOf(value, {
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
        observeOf<T>(target[i], {
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
