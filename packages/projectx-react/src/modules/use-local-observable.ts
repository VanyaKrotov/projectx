import { useEffect, useId, useRef } from "react";

import { ManagerInstance, observableValue } from "projectx/client";

function useLocalObservable<T>(getState: () => T): T {
  const ref = useRef<ManagerInstance<T>>();
  if (!ref.current) {
    ref.current = observableValue(getState(), {
      path: [`LocalState#${useId()}`],
    });
  }

  useEffect(() => {
    return () => {
      ref.current?.dispose();
      ref.current = undefined;
    };
  }, []);

  return ref.current.snapshot;
}

export default useLocalObservable;
