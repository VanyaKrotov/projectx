import {
  Annotation,
  ManagerInstance,
  ManagerOptions,
  ObserverTypes,
} from "../../shared/types";
import { createUniqPath } from "../../shared/utils";

import { ObserverWithType } from "../../components/observer";

import { interceptor } from "../initialize";

abstract class Manager<T, A extends Annotation, M>
  extends ObserverWithType<T, ObserverTypes>
  implements Partial<ManagerInstance<T, M>>
{
  protected annotation: A = {} as A;
  public path: string[] = [];

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

  protected joinToPath(key: string | symbol): string[] {
    return [...this.path, String(key)];
  }

  public get name(): string {
    return this.path[this.path.length - 1];
  }

  public get snapshot(): T {
    // @ts-ignore
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
