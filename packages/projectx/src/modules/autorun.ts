import type { WatchCallback } from "../shared";
import { runAfterScript } from "../shared";

import { Reaction } from "./reaction";

function autorun<T>(fn: () => T): VoidFunction {
  const reaction = new Reaction();

  reaction.syncCaptured(fn);

  const watch: WatchCallback = () => {
    reaction.syncCaptured(fn);

    runAfterScript(() => reaction.watch(watch));
  };

  reaction.watch(watch);

  return () => {
    reaction.dispose();
  };
}

export { autorun };
