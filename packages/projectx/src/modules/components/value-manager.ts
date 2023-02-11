import type { ManagerOptions, ValueManagerInstance } from "../../shared";

import BasicManager from "./basic-manager";

class ValueManager<T>
  extends BasicManager<T>
  implements ValueManagerInstance<T>
{
  constructor(target: T, options: ManagerOptions) {
    super(target, options);
  }

  public set(value: T): boolean {
    const prev = this.target;

    this.target = value;

    this.emit("change", {
      current: value,
      prev,
    });

    return true;
  }
}

export default ValueManager;
