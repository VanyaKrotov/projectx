import type {
  Annotated,
  ManagerInstance,
  ManagerOptions,
  RequiredManagerInstance,
} from "../../shared/types";

import ObjectManager from "./object-manager";

class DynamicObjectManager<T extends object | Annotated>
  extends ObjectManager<T>
  implements RequiredManagerInstance<T>
{
  protected proxy: T;

  private handlers: Required<
    Pick<ProxyHandler<T>, "deleteProperty" | "defineProperty">
  > = {
    deleteProperty: (_target, key) => {
      const manager = this.managers[key];
      const deleteResult = delete this.managers[key];

      if (deleteResult) {
        manager.dispose();
        this.emit("remove", { prev: manager.value });
      }

      return deleteResult;
    },
    defineProperty: (_target, key, prop) => {
      const result = super.defineField(key, prop);

      this.emit("add", {
        current: this.value,
      });

      return result;
    },
  };

  constructor(target: T, options?: ManagerOptions) {
    super(target, options);

    this.proxy = this.defineProxy(target);
  }

  public get snapshot(): T {
    return Object.entries(this.managers).reduce(
      (acc, [key, value]) => Object.assign(acc, { [key]: value.snapshot }),
      {} as T
    );
  }

  public get value(): T {
    this.reportUsage();

    return this.proxy;
  }

  public set(value: T): boolean {
    this.proxy = this.defineProxy(value);

    return this.define(value);
  }

  public manager(key: string | symbol): ManagerInstance {
    return this.managers[key];
  }

  protected defineProxy(target: T): T {
    return new Proxy(target, this.handlers);
  }
}

export default DynamicObjectManager;
