import { useContext, useEffect, useRef, useState } from "react";

import {
  DataObject,
  EqualResolver,
  ObserveStateInstance,
} from "projectx.state";
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

interface LocalStateOptions {
  mode: "strict" | "react";
}

function useLocalState<S extends DataObject, T extends ObserveStateInstance<S>>(
  initial: () => T,
  { mode = "react" }: Partial<LocalStateOptions> = {}
): T {
  const [_, forceUpdate] = useState([]);
  const ref = useRef<T>();
  if (!ref.current) {
    ref.current = initial();
  }

  useEffect(() => {
    let unsubscribe: VoidFunction;
    if (mode === "react") {
      unsubscribe = ref.current!.listen(() => forceUpdate([]));
    }

    return () => {
      unsubscribe?.();

      if (ref.current) {
        ref.current.dispose();
        ref.current = undefined;
      }
    };
  }, []);

  return ref.current!;
}

export { useWatch, useStateOrDefault, useSelect, useLocalState };
