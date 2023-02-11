import type {
  Annotated,
  ManagerInstance,
  ManagerOptions,
  EntryAnnotation,
  ObserverAnnotation,
  RequiredManagerInstance,
} from "../../shared";
import {
  findManager,
  getFieldsOfObject,
  isFunctionDescriptor,
  ANNOTATIONS,
  RESERVED_FIELDS,
} from "../../shared";

import { observable as observableValue } from "../observable";

import Manager from "./manager";
import { managers } from "../../components";

class ObjectManager<T extends object | Annotated>
  extends Manager<T, ObserverAnnotation, Map<any, ManagerInstance>>
  implements RequiredManagerInstance<T>
{
  public values = new Map<any, ManagerInstance>();

  constructor(public target: T, options?: ManagerOptions) {
    super(options, ANNOTATIONS.observer);

    this.define(target);
  }

  protected get annotations(): EntryAnnotation {
    return (this.target as Annotated).annotation || {};
  }

  protected defineField(
    key: string | symbol,
    description: PropertyDescriptor
  ): boolean {
    const { observable = true, ...restAnnotation } =
      this.annotations[key as string] || {};
    let isReservedName;
    if (
      !observable ||
      findManager(managers, ({ target }) => target === description.value) ||
      (isReservedName = RESERVED_FIELDS.includes(String(key)))
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
      get: () => this.values.get(key)!.value,
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

  public get value(): T {
    this.reportUsage();

    return this.target;
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
    for (const [key, manager] of this.values) {
      manager.dispose();
    }

    this.values.clear();
  }

  public manager(key: string | symbol): ManagerInstance | null {
    return this.values.get(key) || null;
  }

  public getTarget(): T {
    return this.target;
  }

  protected define(target: T): boolean {
    this.disposeManagers();

    this.registerManager();

    const fields = getFieldsOfObject(target);
    for (const key in fields) {
      this.defineField(key, fields[key]);
    }

    return true;
  }
}

export default ObjectManager;
