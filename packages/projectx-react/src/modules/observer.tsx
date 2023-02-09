import React, {
  ComponentType,
  useEffect,
  useRef,
  ReactElement,
  FC,
} from "react";

// TODO: заменить на либу из npm
// @ts-ignore
import { Reaction, ReactionInstance } from "projectx/client";

import { useForceUpdate } from "../shared/hooks";
import { LocalObserverProps } from "../shared/types";

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

    return () => {
      ref.current!.dispose();
      ref.current = null;
    };
  }, []);

  return component;
}

function observer<P extends object>(Comp: ComponentType<P>): FC<P> {
  const componentName = Comp.displayName || Comp.name || Comp.constructor.name;

  return (props: P) => {
    return useObserveComponent<P>(() => <Comp {...props} />, componentName);
  };
}

function LocalObserver({ children }: LocalObserverProps) {
  return useObserveComponent(children);
}

export { observer, LocalObserver };
