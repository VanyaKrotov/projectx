import { useRef } from "react";

// @ts-ignore
import { create } from "../../../projectx";
import { createReaction } from "../../../projectx/src/client";

import type { ReactionInstance } from "../shared/types";
import { useForceUpdate, useHandleReaction } from "../shared";

function useLocalObservable<T>(getState: () => T): T {
  const state = useRef<T>();
  const reaction = useRef<ReactionInstance>();
  const forceUpdate = useForceUpdate();
  if (!state.current) {
    state.current = create(getState());
    reaction.current = createReaction(forceUpdate, "LocalReaction");
  }

  useHandleReaction(reaction.current!, {
    unmount: () => {
      state.current = undefined;
      reaction.current = undefined;
    },
  });

  return state.current!;
}

export default useLocalObservable;
