import { isObject } from "../../../shared";

import ObjectManager from "./object-manager";

class DynamicObjectManager<T extends object>
  extends ObjectManager<T>
  implements ObjectManagerInstance<T, Map<Path, ManagerInstance>>
{
  protected proxy: T;

  private handlers: Required<
    Pick<ProxyHandler<T>, "deleteProperty" | "defineProperty">
  > = {
    deleteProperty: (_target, key) => {
      const manager = this.values.get(key);
      const deleteResult = this.values.delete(key);

      if (deleteResult && manager) {
        manager.dispose();
        this.emit("compression", { prev: this.target });
      }

      return deleteResult;
    },
    defineProperty: (_target, key, prop) => {
      const result = super.defineField(key as string, prop);

      this.emit("expansion", {
        current: this.target,
      });

      return result;
    },
  };

  constructor(target: T, options?: ObjectManagerOptions) {
    super(target, options);

    this.proxy = this.defineProxy(target);
  }

  public set(value: T): boolean {
    this.proxy = this.defineProxy(value);
    this.target = value;

    return this.define(value);
  }

  public source(): T {
    return this.proxy;
  }

  protected defineProxy(target: T): T {
    return new Proxy(target, this.handlers);
  }

  public support(value: T): boolean {
    return isObject(value);
  }
}

export default DynamicObjectManager;
