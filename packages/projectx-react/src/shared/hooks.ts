import { useEffect, useState } from "react";

import type { UseHandleReactionOptions, ReactionInstance } from "./types";

export function useForceUpdate(): VoidFunction {
  const [_, setState] = useState([]);

  return () => setState([]);
}

export function useHandleReaction(
  reaction: ReactionInstance,
  { didnmount, unmount }: UseHandleReactionOptions
) {
  reaction.start();

  useEffect(() => {
    reaction.end();
  });

  useEffect(() => {
    didnmount?.();

    return () => {
      reaction.dispose();
      unmount?.();
    };
  }, []);
}
