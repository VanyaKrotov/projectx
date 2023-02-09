import type {
  Annotated,
  ManagerInstance,
  ManagerOptions,
  EntryAnnotation,
  ObserverAnnotation,
  RequiredManagerInstance,
} from "../../shared/types";
import { getFieldsOfObject, getFieldType } from "../../shared/utils";
import { ANNOTATIONS, RESERVED_FIELDS } from "../../shared/constants";

import { observable as observableValue } from "../observable";

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

  constructor(protected target: T, options?: ManagerOptions) {
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
    if (RESERVED_FIELDS.includes(key as string)) {
      throw new Error(`Name \`${String(key)}\` reserved for [projectx]!`);
    }

    const type = getFieldType(description);
    const { observable = true, ...restAnnotation } =
      this.annotations[key as string] || {};
    if (type === "action" || !observable) {
      return Boolean(Object.defineProperty(this.target, key, description));
    }

    const options = {
      path: this.joinToPath(key),
      annotation: restAnnotation,
    };
    const {
      get,
      value,
      configurable = true,
      enumerable = true,
      ...restDesc
    } = description;
    let createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
    };
    if (type === "computed") {
      this.managers[key] = new ComputedManager(get!.bind(this.target), options);
      createDescription = {
        ...createDescription,
        ...restDesc,
        get: this.managers[key].value,
      };
    } else {
      this.managers[key] = observableValue(value, options);

      createDescription = {
        ...createDescription,
        get: () => this.managers[key].value,
        set: (value) => this.managers[key].set(value),
      };
    }

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

    const fieldsInfo = getFieldsOfObject(target);
    for (const key in fieldsInfo) {
      this.defineField(key, fieldsInfo[key]);
    }

    return true;
  }
}

export default ObjectManager;
