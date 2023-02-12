import type {
  ManagerInstance,
  ContainerManagerInstance,
  ManagerOptions,
  Path,
  Annotation,
} from "../../shared";

import BasicManager from "./basic-manager";

abstract class ContainerManager<T, V, E = T>
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

  public abstract changeField(
    key: Path,
    value: E,
    description?: PropertyDescriptor,
    annotation?: Annotation
  ): boolean;

  public abstract get keys(): Path[];

  public abstract disposeManagers(): void;

  public abstract manager(key: Path): ManagerInstance | null;
}

export default ContainerManager;
