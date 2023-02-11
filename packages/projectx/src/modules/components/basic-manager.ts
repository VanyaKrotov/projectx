import type {
  ManagerInstance,
  ManagerOptions,
  Path,
  ActionTypes,
} from "../../shared";
import { createUniqPath } from "../../shared";

import { interceptor } from "../../components";

import { ObserverWithType } from "./observer";

abstract class BasicManager<T>
  extends ObserverWithType<T, ActionTypes>
  implements ManagerInstance<T>
{
  public path: Path[];

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

  protected joinToPath(key: Path): Path[] {
    return this.path.concat(key);
  }

  public dispose(): void {
    this.path = [];
  }

  public get(): T {
    this.reportUsage();

    return this.source();
  }

  public get name(): Path {
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
