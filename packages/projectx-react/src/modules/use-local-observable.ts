import { useRef } from "react";

import {
  ContainerManagerInstance,
  createUniqPath,
  ManagerInstance,
  observableValue,
  Reaction,
  ReactionInstance,
} from "projectx/client";

import { useHandleReaction } from "../shared";

function useLocalObservable<T>(getState: () => T): T {
  const manager = useRef<ManagerInstance<T>>();
  const reaction = useRef<ReactionInstance>();
  if (!manager.current) {
    manager.current = observableValue(getState(), {
      path: [createUniqPath("LocalState")],
    });

    reaction.current = new Reaction(
      "LocalReaction",
      new Map([
        [manager.current.name, manager.current as ContainerManagerInstance<T>],
      ])
    );
  }

  useHandleReaction(reaction.current!, () => {
    manager.current?.dispose();
    manager.current = undefined;
    reaction.current = undefined;
  });

  return manager.current.source();
}

export default useLocalObservable;
