import { useRef, ReactElement } from "react";

import { Reaction } from "projectx.store/src/client";

import type { ObserverComponentRefData } from "../shared/types";
import { useForceUpdate, useHandleReaction } from "../shared/hooks";

function useObserveComponent<P extends object>(
  fn: () => ReactElement<P>,
  name?: string
): ReactElement<P> {
  const ref = useRef<ObserverComponentRefData>();
  const forceUpdate = useForceUpdate();
  if (!ref.current) {
    const reaction = new Reaction(name);

    reaction.setReactionCallback(() => {
      ref.current!.isCallBeforeMount = !ref.current!.isMount;

      forceUpdate();
    });

    ref.current = {
      reaction,
      isMount: false,
      isCallBeforeMount: false,
    };
  }

  useHandleReaction(ref.current!.reaction, {
    unmount: () => {
      ref.current = undefined;
    },
    didnmount: () => {
      ref.current!.isMount = true;

      if (ref.current?.isCallBeforeMount) {
        forceUpdate();
      }
    },
  });

  return fn();
}

export { useObserveComponent };
