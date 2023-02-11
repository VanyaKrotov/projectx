import type {
  ManagerInstance,
  ContainerManagerInstance,
  ManagerOptions,
  ManagerPath,
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

  public get keys(): ManagerPath[] {
    return [];
  }

  public disposeManagers(): void {}

  public manager(key: string): ManagerInstance | null {
    throw new Error("Method is not implemented!");
  }
}

export default ContainerManager;
