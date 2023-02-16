import {
  AnnotationTypes,
  defineServiceProperty,
  deleteServiceProperty,
} from "../../../shared";
import BasicManager from "./basic-manager";

abstract class ContainerManager<T extends object, V, E = T>
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
    this.instanceRemoved(this.source());
    this.disposeManagers();
    super.dispose();
  }

  protected instanceCreated(target: T): void {
    defineServiceProperty(target, true);
  }

  protected instanceRemoved(target: T): void {
    deleteServiceProperty(target);
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
