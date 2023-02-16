import {
  isObjectOfClass,
  getAllObjectFields,
  isFunctionDescriptor,
  AnnotationTypes,
  isObserveValue,
} from "../../../shared";

import { observeOf } from "../../observe-of";

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

    this.instanceCreated(this.target);
  }

  protected createManager(
    key: Path,
    value: T,
    description?: PropertyDescriptor,
    annotation?: number
  ): ManagerInstance<T> {
    const created = observeOf(
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

  protected defineField(key: string, descriptor: PropertyDescriptor): boolean {
    const fieldAnnotation = this.annotations[key];
    if (
      fieldAnnotation === AnnotationTypes.native ||
      isFunctionDescriptor(descriptor) ||
      isObserveValue(descriptor.value)
    ) {
      return false;
    }

    let {
      get,
      value = get?.bind(this.target),
      configurable = true,
      enumerable = true,
    } = descriptor;

    this.values.set(
      key,
      this.createManager(key, value, descriptor, fieldAnnotation)
    );

    const createDescription: PropertyDescriptor = {
      configurable,
      enumerable,
      get: () => this.values.get(key)!.get(),
      set: (value) => this.setValue(key, value, descriptor, fieldAnnotation),
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

    const fields = getAllObjectFields(target);
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
