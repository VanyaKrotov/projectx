import { OneOrArray } from "types";

interface CreateSelectorResult<I extends never[], T> {
  (...states: I): T;
  dispose(): void;
}

function createSelector<T extends never[], R extends never, P>(
  selectors: OneOrArray<(...args: T) => unknown>,
  selector: (...values: R[]) => P
): CreateSelectorResult<T, P> {
  if (!Array.isArray(selectors)) {
    selectors = [selectors];
  }

  let memo: P;
  let hasMemo = false;

  let memos: R[];

  const updateMemo = (value: P, values: R[]): P => {
    hasMemo = true;
    memo = value;

    memos = values;

    return value;
  };

  const caller = (...states: T) => {
    const values = (selectors as ((...args: T) => R)[]).map((selector) =>
      selector(...states)
    );
    if (memos && values.every((val, index) => val === memos[index])) {
      return memo;
    }

    return updateMemo(selector.apply(null, values), values);
  };

  caller.dispose = () => {
    (memo as unknown) = null;
    hasMemo = false;
  };

  return caller;
}

export { createSelector };
