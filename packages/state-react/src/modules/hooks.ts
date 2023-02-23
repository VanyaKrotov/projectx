import { useContext, useEffect, useState } from "react";

import {
  DataObject,
  EqualResolver,
  ObserveStateInstance,
} from "../../../state/src";
import { DefaultContext, getValues } from "../shared";

function useStateOrDefault<S extends ObserveStateInstance>(state?: S): S {
  const context = useContext(DefaultContext);
  const workState = (state || context) as S;
  if (!workState) {
    throw new Error("Context hasn't `state` and prop state is required!");
  }

  return workState;
}

function useSelect<R = unknown, S extends DataObject = DataObject>(
  selector: (state: ObserveStateInstance<S>) => R,
  state?: ObserveStateInstance<S>,
  equalResolver?: EqualResolver<R>
): R {
  const workState = useStateOrDefault(state);
  const [result, setResult] = useState(() => selector(workState));

  useEffect(
    () =>
      workState.reaction([() => selector(workState)], setResult, {
        resolver: equalResolver as EqualResolver<unknown>,
      }),
    [selector, workState]
  );

  return result;
}

function useWatch<R = unknown[], S extends DataObject = DataObject>(
  paths: string[],
  state?: ObserveStateInstance<S>
): R {
  const workState = useStateOrDefault(state);
  const [result, setResult] = useState<R>(() => getValues(workState, paths));

  useEffect(
    () => workState.watch(paths, () => setResult(getValues(workState, paths))),
    [paths, workState]
  );

  return result;
}

export { useWatch, useStateOrDefault, useSelect };
