import type {
  Annotation,
  FreeManagerInstance,
  ManagerInstance,
  ManagerOptions,
  ObserverTypes,
} from "../../shared";
import { createUniqPath } from "../../shared";

import { ObserverWithType } from "./observer";

import { interceptor } from "../../components";

abstract class Manager<T, A extends Annotation, M>
  extends ObserverWithType<T, ObserverTypes>
  implements FreeManagerInstance<T>
{
  protected annotation: A = {} as A;
  public path: any[] = [];
  public target: T = null as T;

  constructor(
    { path = [createUniqPath()], annotation }: ManagerOptions = {},
    defaultAnnotation: A
  ) {
    super();

    this.path = path;
    this.annotation = { ...defaultAnnotation, ...annotation };
  }

  public dispose(): void {
    this.path = [];
    this.disposeManagers();
    this.emit("dispose", { prev: this.snapshot });
  }

  protected reportUsage(): void {
    interceptor.emit({ path: this.path });
  }

  protected joinToPath(key: any): any[] {
    return [...this.path, key];
  }

  protected registerManager() {
    if (typeof this.target !== "object") {
      return;
    }

    Object.defineProperty(this.target, Symbol("[manager]"), {
      enumerable: false,
      value: this,
      writable: false,
    });
  }

  public get name(): string {
    return this.path[this.path.length - 1];
  }

  public get snapshot(): T {
    return this.target;
  }

  public get keys(): string[] {
    return [];
  }

  public toString(): string {
    return String(this.snapshot);
  }

  public disposeManagers(): void {}
}

export default Manager;
