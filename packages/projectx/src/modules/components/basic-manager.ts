import type {
  ManagerInstance,
  ManagerOptions,
  ManagerPath,
  ObserverTypes,
} from "../../shared";
import { createUniqPath } from "../../shared";

import { interceptor } from "../../components";

import { ObserverWithType } from "./observer";

abstract class BasicManager<T>
  extends ObserverWithType<T, ObserverTypes>
  implements ManagerInstance<T>
{
  public path: ManagerPath[];

  constructor(
    public target: T,
    {
      path = [createUniqPath()],
    }: Omit<ManagerOptions<never>, "annotation"> = {}
  ) {
    super();

    this.path = path;

    this.emit("define", { current: this.target });
  }

  protected reportUsage(): void {
    interceptor.emit({ path: this.path });
  }

  protected joinToPath(key: ManagerPath): ManagerPath[] {
    return this.path.concat(key);
  }

  public dispose(): void {
    this.path = [];
  }

  public get(): T {
    this.reportUsage();

    return this.source();
  }

  public get name(): ManagerPath {
    return this.path[this.path.length - 1];
  }

  public set(_value: T): boolean {
    return false;
  }

  public get snapshot(): T {
    return this.target;
  }

  public source(): T {
    return this.target;
  }

  public toString(): string {
    return String(this.target);
  }
}

export default BasicManager;
