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
  extends Manager<
    T,
    ObserverAnnotation,
    Record<string | symbol, ManagerInstance<any>>
  >
  implements RequiredManagerInstance<T>
{
  public managers: Record<string | symbol, ManagerInstance> = {};

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

    this.managers[key] = observableValue(
      value,
      {
        path: this.joinToPath(key),
        annotation: restAnnotation,
      },
      description
    );

    const createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
      get: () => this.managers[key].value,
      set: (value) => this.managers[key].set(value),
    };

    return Boolean(Object.defineProperty(this.target, key, createDescription));
  }

  public get snapshot(): T {
    return Object.entries(this.managers).reduce(
      (acc, [key, value]) => Object.assign(acc, { [key]: value.snapshot }),
      {} as T
    );
  }

  public get value(): T {
    this.reportUsage();

    return this.target;
  }

  public get keys() {
    return Object.keys(this.managers);
  }

  public set(value: T): boolean {
    this.target = value;
    const prev = { ...this.target };

    this.define(value);

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
