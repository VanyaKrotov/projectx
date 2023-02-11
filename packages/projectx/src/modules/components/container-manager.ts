import type {
  ManagerInstance,
  ContainerManagerInstance,
  ManagerOptions,
  Path,
} from "../../shared";

import BasicManager from "./basic-manager";

abstract class ContainerManager<T, V>
  extends BasicManager<T>
  implements ContainerManagerInstance<T, V>
{
  constructor(
    target: T,
    public values: V,
    options?: Omit<ManagerOptions, "annotation">
  ) {
    super(target, options);
  }

  public dispose(): void {
    this.disposeManagers();
    super.dispose();
  }

  public get keys(): Path[] {
    return [];
  }

  public disposeManagers(): void {}

  public manager(key: Path): ManagerInstance | null {
    throw new Error("Method is not implemented!");
  }
}

export default ContainerManager;
