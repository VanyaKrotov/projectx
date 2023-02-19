import type {
  StateInstance,
  ReactionOptions,
  EachObject,
} from "../shared/types";

import { Observer } from "../components";
import { defaultEqualResolver } from "../shared";
import { manager } from "./batch";

abstract class State<S extends EachObject = EachObject>
  extends Observer<S>
  implements StateInstance<S>
{
  public abstract readonly data: S;

  public change(change: Partial<S> | ((prev: S) => S)): void {
    let value = change as S;
    if (typeof change === "function") {
      value = change(this.data);
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
    let memo = callSelectors();
    if (initCall) {
      action.apply(null, memo);
    }

    const handler = () => {
      if (!hasSelector) {
        return action.apply(null, memo);
      }

      const values = callSelectors();
      if (values.every((value, index) => resolver(value, memo[index]))) {
        return;
      }

      memo = values;

      return action.apply(null, memo);
    };

    return this.listen(() => manager.action(handler));
  }
}

export default State;
