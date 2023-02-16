import {
  ObjectManagerInstance,
  Path,
  ManagerInstance,
  isObjectOfClass,
  AnnotationTypes,
  ObjectManagerOptions,
} from "../../../shared";
import {
  findManager,
  getFieldsOfObject,
  isFunctionDescriptor,
} from "../../../shared";

import { observable as observableValue } from "../../observable";

import { managers } from "../../../components";
import { ContainerManager } from "../abstraction";

class ObjectManager<T extends object>
  extends ContainerManager<T, Map<Path, ManagerInstance>>
  implements ObjectManagerInstance<T, Map<Path, ManagerInstance>>
{
  protected annotations: Record<string, number>;

  constructor(
    target: T,
    { annotations = {}, ...options }: ObjectManagerOptions = {}
  ) {
    super(target, new Map<Path, ManagerInstance>(), options);

    this.annotations = annotations;

    this.define(target);
  }

  protected createManager(
    key: Path,
    value: T,
    description?: PropertyDescriptor,
    annotation?: number
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

  public setValue(
    key: Path,
    value: T,
    description?: PropertyDescriptor | undefined,
    annotation?: number
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
    // TODO
    if (
      this.annotations[key] === AnnotationTypes.none ||
      findManager(managers, ({ target }) => target === description.value)
    ) {
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

    const fieldAnnotation = this.annotations[key];

    this.values.set(
      key,
      this.createManager(key, value, description, fieldAnnotation)
    );

    const createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
      get: () => this.values.get(key)!.get(),
      set: (value) => this.setValue(key, value, description, fieldAnnotation),
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
