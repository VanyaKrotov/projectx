import type { OneOrArray, WatchOptions } from "types";

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

function watchGroup<E extends State<object>[], R extends unknown>(
  states: E,
  selectors: OneOrArray<(...state: never[]) => R>,
  action: (...args: R[]) => void,
  {
    resolver = defaultEqualResolver,
    initCall = false,
  }: Partial<WatchOptions> = {}
): VoidFunction {
  if (!Array.isArray(selectors)) {
    selectors = [selectors];
  }

  let memos = new Array(selectors.length);
  const stateModels = states.map(({ state }) => state);
  if (initCall) {
    memos = selectors.map((selector) =>
      selector.apply(null, stateModels as never[])
    );

    action.apply(memos);
  }

  const unsubscrives = states.map((state) =>
    state.listen(() => {
      const values = (selectors as Function[]).map((selector) =>
        selector.apply(null, stateModels)
      );
      if (values.some((value, index) => !resolver(value, memos[index]))) {
        action.apply(null, values);
      }

      memos = values;
    })
  );

  return () => {
    unsubscrives.forEach((uns) => uns());
  };
}

export { watch, watchGroup };
