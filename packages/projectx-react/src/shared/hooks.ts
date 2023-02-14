import { useEffect, useState } from "react";
import { ReactionInstance } from "projectx.store/src/client";

import type { UseHandleReactionOptions } from "./types";

export function useForceUpdate(): VoidFunction {
  const [_, setState] = useState([]);

  return () => setState([]);
}

export function useHandleReaction(
  reaction: ReactionInstance,
  { didnmount, unmount }: UseHandleReactionOptions
) {
  reaction.startCatchCalls();

  useEffect(() => {
    reaction.endCatchCalls();

    if (reaction.isEmptyObservers) {
      console.warn(
        `[projectx.store-react] Reaction \`${reaction.id}\` not have dependencies. We advise you to reconsider its use.`
      );
    }
  });

  useEffect(() => {
    didnmount?.();

    return () => {
      reaction.dispose();
      unmount?.();
    };
  }, []);
}
