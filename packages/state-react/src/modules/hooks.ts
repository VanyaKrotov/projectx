import { useEffect, useState } from "react";

import { EqualResolver, ObserveStateInstance } from "../../../state/src";

export function useSelect<S extends object, R = unknown>(
  state: ObserveStateInstance<S>,
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
