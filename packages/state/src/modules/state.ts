import type { StateInstance } from "types";

import { Observer } from "../components";

abstract class State<T extends object>
  extends Observer<unknown>
  implements StateInstance<T>
{
  public abstract state: T;

  public change(
    change: Partial<T> | ((prev: T) => T),
    afterChange?: VoidFunction
  ): void {
    let value = change;
    if (typeof change === "function") {
      value = (change as Function)(this.state);
    }

    Object.assign(this.state, value);

    this.emit({});

    afterChange?.();
  }
}

export default State;
