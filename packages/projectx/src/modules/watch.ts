import type { WatchOptions } from "../shared";
import { runAfterScript } from "../shared";

import { Reaction } from "./reaction";

function watch<T>(
  contextFn: () => T,
  callback: (current: T, prev: T) => void,
  {
    isEqual = (a, b) => a === b,
    initialCall = false,
  }: Partial<WatchOptions<T>> = {}
): VoidFunction {
  const reaction = new Reaction();
  let result = reaction.syncCaptured(contextFn);
  if (initialCall) {
    callback(result, undefined as T);
  }

  const watch = () => {
    const value = reaction.syncCaptured(contextFn);
    if (!isEqual(value, result)) {
      callback(value, result);
      result = value;
    }

    runAfterScript(() => reaction.watch(watch));
  };

  reaction.watch(watch);

  return () => {
    reaction.dispose();
  };
}

export { watch };
