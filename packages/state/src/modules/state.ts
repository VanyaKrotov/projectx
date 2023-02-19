import type { StateInstance, ReactionOptions } from "../shared/types";

import { Observer } from "../components";
import { defaultEqualResolver } from "../shared";

abstract class State<S extends object = object>
  extends Observer<S>
  implements StateInstance<S>
{
  public abstract readonly data: S;

  public change(
    change: Partial<S> | ((prev: S) => S),
    afterChange?: VoidFunction
  ): void {
    let value = change as S;
    if (typeof change === "function") {
      value = change(this.data);
    }

    if (this.data === value) {
      return;
    }

    const previous = {} as S;
    for (const key in value) {
      previous[key] = this.data[key];
      this.data[key] = value[key];
    }

    this.emit({
      current: value,
      previous,
    });

    afterChange?.();
  }

  public reaction<T extends unknown[]>(
    selectors: ((state: S) => unknown)[],
    action: (...args: T) => void,
    {
      resolver = defaultEqualResolver,
      initCall = false,
    }: Partial<ReactionOptions> = {}
  ): VoidFunction {
    const callSelectors = () =>
      selectors.map((selector) => selector(this.data)) as T;
    const hasSelector = selectors.length > 0;
    let memo: T = callSelectors();
    if (initCall) {
      action.apply(null, memo);
    }

    return this.listen(() => {
      if (!hasSelector) {
        return action.apply(null, memo);
      }

      const values = callSelectors();
      if (values.every((value, index) => resolver(value, memo[index]))) {
        return;
      }

      memo = values;

      return action.apply(null, memo);
    });
  }
}

export default State;
