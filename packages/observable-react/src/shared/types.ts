import { ReactElement } from "react";
// @ts-ignore
import { createReaction } from "../../../projectx/src/client";
export interface LocalObserverProps<P> {
  children: () => ReactElement<P>;
}

export interface UseHandleReactionOptions {
  unmount: VoidFunction;
  didnmount?: VoidFunction;
}

export type ReactionInstance = ReturnType<typeof createReaction>;

export interface ObserverComponentRefData {
  isMount: boolean;
  isCallBeforeMount: boolean;
  reaction: ReactionInstance;
}
