import { useEffect, useState } from "react";

import { EqualResolver, StateInstance } from "../../../state/src";

export function useSelect<S extends object, R = unknown>(
  state: StateInstance<S>,
  selector: (state: S) => R,
  equalResolver?: EqualResolver<R>
): R {
  const [result, setResult] = useState(selector(state.data));

  useEffect(
    () =>
      state.reaction([selector], setResult, {
        resolver: equalResolver as EqualResolver<unknown>,
      }),
    [selector]
  );

  return result;
}
