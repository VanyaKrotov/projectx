import type {
  Annotated,
  ComputedAnnotation,
  ManagerInstance,
  ManagerOptions,
  EntryAnnotation,
  ObserverAnnotation,
  RequiredManagerInstance,
} from "shared/types";
import { getGetters } from "shared/utils";
import { ANNOTATIONS } from "shared/constants";

import { observable } from "modules/observable";

import Manager from "./manager";
import ComputedManager from "./computed-manager";

class ObjectManager<T extends object | Annotated>
  extends Manager<
    T,
    ObserverAnnotation,
    Record<string | symbol, ManagerInstance<any>>
  >
  implements RequiredManagerInstance<T>
{
  public managers: Record<string | symbol, ManagerInstance> = {};

  private proxy: T;

  private get annotations(): EntryAnnotation {
    const annotation = (this.target as Annotated).annotation || {};

    return {
      fields: {},
      getters: {},
      ...annotation,
    };
  }

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
      const result = this.defineProp(
        key,
        prop,
        this.annotations.fields[String(key)]
      );

      this.emit("add", {
        current: this.value,
      });

      return result;
    },
  };

  private defineProp(
    key: string | symbol,
    { value, configurable = true, enumerable = true }: PropertyDescriptor,
    options?: ObserverAnnotation
  ): boolean {
    this.managers[key] = observable(value, {
      path: this.joinToPath(key),
      annotation: options,
    });

    Object.defineProperty(this.target, key, {
      configurable,
      enumerable,
      get: () => this.managers[key].value,
      set: (value) => this.managers[key].set(value),
    });

    return true;
  }

  private defineComp(
    key: string,
    { get, ...descriptions }: PropertyDescriptor,
    options?: ComputedAnnotation
  ): void {
    this.managers[key] = new ComputedManager(get!.bind(this.target), {
      path: this.joinToPath(key),
      annotation: options,
    });

    Object.defineProperty(this.target, key, {
      ...descriptions,
      get: this.managers[key].value,
    });
  }

  constructor(private target: T, options: ManagerOptions) {
    super(options, ANNOTATIONS.observer);

    this.proxy = this.define(target);
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

  public get keys() {
    return Object.keys(this.managers);
  }

  public set(value: T): boolean {
    this.target = value;
    const prev = { ...this.target };

    this.proxy = this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public disposeManagers() {
    for (const key in this.managers) {
      this.managers[key].dispose();
    }

    this.managers = {};
  }

  public manager(key: string | symbol): ManagerInstance {
    return this.managers[key];
  }

  private define(target: T): T {
    this.disposeManagers();

    const proxy = new Proxy(target, this.handlers);
    const getters = getGetters(target, ["annotation"]);

    const annotation = this.annotations;

    for (const key in target) {
      this.defineProp(key, { value: target[key] }, annotation.fields[key]);
    }

    for (const key in getters) {
      this.defineComp(key, getters[key], annotation.getters[key]);
    }

    return proxy;
  }
}

export default ObjectManager;
