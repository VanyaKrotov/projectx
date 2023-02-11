import type {
  Annotated,
  ManagerInstance,
  ManagerOptions,
  ManagerPath,
  ObjectManagerInstance,
  ObserverAnnotation,
} from "../../shared";

import ObjectManager from "./object-manager";

class DynamicObjectManager<T extends object | Annotated>
  extends ObjectManager<T>
  implements
    ObjectManagerInstance<
      T,
      ObserverAnnotation,
      Map<ManagerPath, ManagerInstance>
    >
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

  constructor(target: T, options?: ManagerOptions<ObserverAnnotation>) {
    super(target, options);

    this.proxy = this.defineProxy(target);
  }

  public get(): T {
    this.reportUsage();

    return this.proxy;
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
}

export default DynamicObjectManager;
