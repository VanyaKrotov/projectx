import { useEffect, useState } from "react";

import { ReactionInstance } from "projectx.store/src/client";

export function useForceUpdate(): VoidFunction {
  const [_, setState] = useState([]);

  return () => setState([]);
}

export function useHandleReaction(
  reaction: ReactionInstance,
  unmount?: VoidFunction
) {
  const forceUpdate = useForceUpdate();

  reaction.startWatch();

  useEffect(() => {
    reaction.endWatch();
    reaction.watch(forceUpdate);
  });

  useEffect(
    () => () => {
      reaction.dispose();
      unmount?.();
    },
    []
  );
}
