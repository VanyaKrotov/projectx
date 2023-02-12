import { useRef, ReactElement } from "react";

import { Reaction, ReactionInstance } from "projectx.store/src/client";

import { useHandleReaction } from "../shared/hooks";

function useObserveComponent<P extends object>(
  fn: () => ReactElement<P>,
  name?: string
): ReactElement<P> {
  const ref = useRef<ReactionInstance>();
  if (!ref.current) {
    ref.current = new Reaction(name);
  }

  useHandleReaction(ref.current, () => {
    ref.current = undefined;
  });

  return fn();
}

export { useObserveComponent };
