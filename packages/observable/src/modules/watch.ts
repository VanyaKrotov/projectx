import { createReaction } from "./reaction";

interface WatchOptions<T> {
  isEqual: (a: T, b: T) => boolean;
  initialCall: boolean;
}

function reaction<T>(
  contextFn: () => T,
  callback: (current: T, prev: T) => void,
  {
    isEqual = (a, b) => a === b,
    initialCall = false,
  }: Partial<WatchOptions<T>> = {}
): VoidFunction {
  const reaction = createReaction(() => {
    const value = reaction.syncCaptured(contextFn);
    if (isEqual(value, result)) {
      return;
    }

    callback(value, result);
    result = value;
  });

  let result = reaction.syncCaptured(contextFn);
  if (initialCall) {
    callback(result, undefined as T);
  }

  return () => {
    reaction.dispose();
  };
}

export { reaction };
