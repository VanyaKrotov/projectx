import {
  ManagerInstance,
  ManagerOptions,
  RequiredManagerInstance,
  ValueAnnotation,
} from "../../shared/types";
import { ANNOTATIONS } from "../../shared/constants";

import Manager from "./manager";

class ValueManager<T>
  extends Manager<T, ValueAnnotation, null>
  implements RequiredManagerInstance<T>
{
  public managers = null;

  constructor(public target: T, options: ManagerOptions) {
    super(options, ANNOTATIONS.value);

    this.emit("define", { current: target });
  }

  get value(): T {
    this.reportUsage();

    return this.target;
  }

  public set(value: any): boolean {
    const prev = this.target;

    this.target = value;

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public manager(): ManagerInstance | null {
    return null;
  }
}

export default ValueManager;
