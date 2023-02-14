import { ReactElement } from "react";
import { ReactionInstance } from "projectx.store/src/client";

export interface LocalObserverProps<P> {
  children: () => ReactElement<P>;
}

export interface UseHandleReactionOptions {
  unmount: VoidFunction;
  didnmount?: VoidFunction;
}

export interface ObserverComponentRefData {
  isMount: boolean;
  isCallBeforeMount: boolean;
  reaction: ReactionInstance;
}
