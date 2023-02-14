import { Reaction } from "./reaction";

function autorun<T>(fn: () => T): VoidFunction {
  const reaction = new Reaction("Autorun");

  reaction.setReactionCallback(() => {
    reaction.syncCaptured(fn);
  });

  reaction.syncCaptured(fn);

  return () => {
    reaction.dispose();
  };
}

export { autorun };
