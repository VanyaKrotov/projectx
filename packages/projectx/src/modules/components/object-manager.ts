import {
  Annotated,
  ManagerOptions,
  EntryAnnotation,
  ObjectManagerInstance,
  Path,
  ManagerInstance,
  ObserverAnnotation,
  Annotation,
  isObjectOfClass,
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
  extends ContainerManager<T, Map<Path, ManagerInstance>>
  implements
    ObjectManagerInstance<T, ObserverAnnotation, Map<Path, ManagerInstance>>
{
  public annotation = ANNOTATIONS.observer;

  constructor(target: T, options?: ManagerOptions<ObserverAnnotation>) {
    super(target, new Map<Path, ManagerInstance>(), options);

    this.annotation = { ...this.annotation, ...options?.annotation };
    this.define(target);
  }

  protected get annotations(): EntryAnnotation {
    return (this.target as Annotated).annotation || {};
  }

  protected createManager(
    key: Path,
    value: T,
    description?: PropertyDescriptor,
    annotation?: Annotation
  ): ManagerInstance<T> {
    const created = observableValue(
      value,
      {
        path: this.joinToPath(key),
        annotation,
      },
      description
    );

    const manager = this.values.get(key);
    if (manager) {
      created.receiveListeners(manager.shareListeners());
      created.emit("reinstall", { current: value, prev: manager?.target });
    }

    return created;
  }

  public changeField(
    key: Path,
    value: T,
    description?: PropertyDescriptor | undefined,
    annotation?: Annotation | undefined
  ): boolean {
    const manager = this.values.get(key)!;
    if (manager.support(value)) {
      return manager.set(value);
    }

    return Boolean(
      this.values.set(
        key,
        this.createManager(key, value, description, annotation)
      )
    );
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

    let {
      get,
      value = get?.bind(this.target),
      configurable = true,
      enumerable = true,
    } = description;

    this.values.set(
      key,
      this.createManager(key, value, description, restAnnotation)
    );

    const createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
      get: () => this.values.get(key)!.get(),
      set: (value) => this.changeField(key, value, description, restAnnotation),
    };

    return Boolean(Object.defineProperty(this.target, key, createDescription));
  }

  public get snapshot(): T {
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

  public support(value: T): boolean {
    return isObjectOfClass(value);
  }
}

export default ObjectManager;
