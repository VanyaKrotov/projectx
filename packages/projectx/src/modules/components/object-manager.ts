import type {
  Annotated,
  ComputedAnnotation,
  ManagerInstance,
  ManagerOptions,
  EntryAnnotation,
  ObserverAnnotation,
  ReactionInstance,
  RequiredManagerInstance,
} from "shared/types";
import { getGetters, runAfterScript } from "shared/utils";

import { observable } from "modules/observable";

import { Reaction } from "../reaction";
import Manager from "./manager";
import { COMPUTED_ANNOTATION, OBSERVER_ANNOTATION } from "./constants";

class ComputedManager<T>
  extends Manager<T, ComputedAnnotation, null>
  implements RequiredManagerInstance<T>
{
  private reaction: ReactionInstance;
  private savedResult?: T;
  private isMemoized = false;
  private isChanged = false;
  public managers = null;

  constructor(private readonly target: T, options: ManagerOptions) {
    super(options, COMPUTED_ANNOTATION);

    this.reaction = new Reaction(`Computed#${this.path.join(".")}`);

    this.emit("define", { current: this.snapshot });
  }

  public getManager(): ManagerInstance | null {
    return null;
  }

  public get snapshot(): T {
    return (this.target as Function)();
  }

  public get value(): T {
    const { memoised } = this.annotation;
    if (!memoised) {
      return this.target;
    }

    return (() => {
      this.reportUsage();

      if (this.isMemoized && !this.isChanged) {
        return this.savedResult!;
      }

      this.savedResult = this.reaction.syncCaptured(this.target as () => T);
      this.isMemoized = true;
      this.isChanged = false;

      this.reaction.watch(() => {
        this.isChanged = true;

        runAfterScript(() => {
          this.emit("change", {
            current: undefined as T,
            prev: this.savedResult!,
          });
        });
      });

      return this.savedResult;
    }) as T;
  }

  public setValue(): boolean {
    return false;
  }

  public dispose(): void {
    this.reaction.dispose();
    super.dispose();
  }
}

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

  private get annotationOptions(): EntryAnnotation {
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
      const result = this.defineProperty(
        key,
        prop,
        this.annotationOptions.fields[String(key)]
      );

      this.emit("add", {
        current: this.value,
      });

      return result;
    },
  };

  private defineProperty(
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
      set: (value) => this.managers[key].setValue(value),
    });

    return true;
  }

  private defineComputed(
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
    super(options, OBSERVER_ANNOTATION);

    this.proxy = this.define(target);
  }

  public get name(): string {
    return this.path[this.path.length - 1];
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

  public setValue(value: T): boolean {
    this.target = value;
    const prev = { ...this.target };

    this.proxy = this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  private clearManagers() {
    for (const key in this.managers) {
      this.managers[key].dispose();
    }

    this.managers = {};
  }

  public dispose(): void {
    super.dispose();
    this.clearManagers();
  }

  public getManager(key: string | symbol): ManagerInstance {
    return this.managers[key];
  }

  private define(target: T): T {
    this.clearManagers();

    const proxy = new Proxy(target, this.handlers);
    const getters = getGetters(target, ["annotation"]);

    const annotation = this.annotationOptions;

    for (const key in target) {
      this.defineProperty(key, { value: target[key] }, annotation.fields[key]);
    }

    for (const key in getters) {
      this.defineComputed(key, getters[key], annotation.getters[key]);
    }

    return proxy;
  }
}

export default ObjectManager;
