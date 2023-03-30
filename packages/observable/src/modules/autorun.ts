import { createReaction } from "./reaction";

function autorun<T>(fn: () => T): VoidFunction {
  const reaction = createReaction(() => {
    reaction.syncCaptured(fn);
  });

  reaction.syncCaptured(fn);

  return () => {
    reaction.dispose();
  };
}

export { autorun };
