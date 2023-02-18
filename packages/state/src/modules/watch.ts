import type { WatchOptions } from "types";

import { defaultEqualResolver } from "../shared";

import State from "./state";

function watch<S extends object, R = unknown>(
  state: State<S>,
  selector: (state: S) => R,
  action: (value: R) => void,
  {
    resolver = defaultEqualResolver,
    initCall = false,
  }: Partial<WatchOptions> = {}
): VoidFunction {
  let memo: R;
  let hasMemo = false;
  const updateMemo = (value: R): R => {
    hasMemo = true;
    memo = value;

    return memo;
  };

  if (initCall) {
    action(updateMemo(selector(state.state)));
  }

  return state.listen(() => {
    const value = selector(state.state);
    if (hasMemo && resolver(memo, value)) {
      return;
    }

    action(updateMemo(value));
  });
}

export { watch };
