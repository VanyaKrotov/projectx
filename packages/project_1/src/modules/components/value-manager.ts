import {
  ManagerInstance,
  ManagerOptions,
  RequiredManagerInstance,
  ValueAnnotation,
} from "shared/types";

import { VALUE_ANNOTATION } from "./constants";
import Manager from "./manager";

class ValueManager<T>
  extends Manager<T, ValueAnnotation, unknown>
  implements RequiredManagerInstance<T>
{
  constructor(public target: T, options: ManagerOptions) {
    super(options, VALUE_ANNOTATION);

    this.emit("define", { current: target });
  }

  get value(): T {
    this.reportUsage();

    return this.target;
  }

  public setValue(value: any): boolean {
    const prev = this.target;

    this.target = value;

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }

  public getManager(): ManagerInstance | null {
    return null;
  }
}

export default ValueManager;
