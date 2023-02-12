import { useEffect, useRef, ReactElement } from "react";

// TODO: заменить на либу из npm
// @ts-ignore
import { Reaction, ReactionInstance } from "projectx/client";

import { useForceUpdate } from "../shared/hooks";

function useObserveComponent<P extends object>(
  fn: () => ReactElement<P>,
  name?: string
): ReactElement<P> {
  const forceUpdate = useForceUpdate();
  const ref = useRef<ReactionInstance | null>(null);
  if (!ref.current) {
    ref.current = new Reaction(name);
  }

  ref.current!.startWatch();

  const component = fn();

  useEffect(() => {
    ref.current!.endWatch();
    ref.current!.watch(forceUpdate);
  });

  useEffect(
    () => () => {
      ref.current!.dispose();
      ref.current = null;
    },
    []
  );

  return component;
}

export { useObserveComponent };
