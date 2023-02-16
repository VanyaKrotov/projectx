import {
  ManagerInstance,
  ContainerManagerInstance,
  ManagerOptions,
  Path,
  AnnotationTypes,
} from "../../../shared";

import BasicManager from "./basic-manager";

abstract class ContainerManager<T, V, E = T>
  extends BasicManager<T>
  implements ContainerManagerInstance<T, V>
{
  constructor(
    target: T,
    public values: V,
    options?: ManagerOptions,
    defaultAnnotation: number = AnnotationTypes.observable
  ) {
    super(target, options, defaultAnnotation);
  }

  public dispose(): void {
    this.disposeManagers();
    super.dispose();
  }

  public abstract setValue(
    key: Path,
    value: E,
    description?: PropertyDescriptor,
    annotation?: number
  ): boolean;

  public abstract get keys(): Path[];

  public abstract disposeManagers(): void;

  public abstract manager(key: Path): ManagerInstance | null;
}

export default ContainerManager;
