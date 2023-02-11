import type {
  Annotated,
  ManagerOptions,
  EntryAnnotation,
  ObjectManagerInstance,
  ManagerPath,
  ManagerInstance,
  ObserverAnnotation,
} from "../../shared";
import {
  findManager,
  getFieldsOfObject,
  isFunctionDescriptor,
  ANNOTATIONS,
  RESERVED_FIELDS,
} from "../../shared";

import { observable as observableValue } from "../observable";

import { managers } from "../../components";
import ContainerManager from "./container-manager";

class ObjectManager<T extends object | Annotated>
  extends ContainerManager<T, Map<ManagerPath, ManagerInstance>>
  implements
    ObjectManagerInstance<
      T,
      ObserverAnnotation,
      Map<ManagerPath, ManagerInstance>
    >
{
  public annotation = ANNOTATIONS.observer;

  constructor(target: T, options?: ManagerOptions<ObserverAnnotation>) {
    super(target, new Map<ManagerPath, ManagerInstance>(), options);

    this.annotation = { ...this.annotation, ...options?.annotation };
    this.define(target);
  }

  protected get annotations(): EntryAnnotation {
    return (this.target as Annotated).annotation || {};
  }

  protected defineField(key: string, description: PropertyDescriptor): boolean {
    const { observable = true, ...restAnnotation } =
      this.annotations[key] || {};
    let isReservedName;
    if (
      !observable ||
      findManager(managers, ({ target }) => target === description.value) ||
      (isReservedName = RESERVED_FIELDS.includes(key))
    ) {
      console.assert(
        !isReservedName,
        `Name \`${String(key)}\` reserved for [projectx]!`
      );

      return false;
    }

    if (isFunctionDescriptor(description)) {
      return Boolean(Object.defineProperty(this.target, key, description));
    }

    const {
      get,
      value = get!.bind(this.target),
      configurable = true,
      enumerable = true,
    } = description;

    if (this.values.has(key)) {
      this.values.get(key)!.dispose();
    }

    this.values.set(
      key,
      observableValue(
        value,
        {
          path: this.joinToPath(key),
          annotation: restAnnotation,
        },
        description
      )
    );

    const createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
      get: () => this.values.get(key)!.get(),
      set: (value) => this.values.get(key)!.set(value),
    };

    return Boolean(Object.defineProperty(this.target, key, createDescription));
  }

  public get snapshot(): T {
    return Array.from(this.values.entries()).reduce(
      (acc, [key, manager]) => Object.assign(acc, { [key]: manager.snapshot }),
      {} as T
    );
  }

  public get keys() {
    return Array.from(this.values.keys());
  }

  public set(value: T): boolean {
    const prev = this.target;
    this.target = value;

    this.define(value);

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public disposeManagers() {
    for (const [, manager] of this.values) {
      manager.dispose();
    }

    this.values.clear();
  }

  public manager(key: string): ManagerInstance | null {
    return this.values.get(key) || null;
  }

  protected define(target: T): boolean {
    this.disposeManagers();

    const fields = getFieldsOfObject(target);
    for (const key in fields) {
      this.defineField(key, fields[key]);
    }

    return true;
  }
}

export default ObjectManager;
