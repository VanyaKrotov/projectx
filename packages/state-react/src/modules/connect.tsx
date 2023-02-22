import React, { ComponentType, forwardRef, useEffect } from "react";

// @ts-ignore
import { DataObject, ObserveStateInstance } from "../../../state";

import type { SelectToProps } from "../shared/types";
import { deepEqual, useForceUpdate } from "../shared";

function useConnect<T extends DataObject, R extends DataObject, P extends {}>(
  state: ObserveStateInstance<T>,
  selector: SelectToProps<T, R>,
  props: P
) {
  const forceUpdate = useForceUpdate();
  let selectProps: R | null = null;
  if (!selectProps) {
    selectProps = selector(state, props);
  }

  useEffect(() => {
    return state.reaction([], () => {
      const nextSelectProps = selector(state, props);
      if (deepEqual(selectProps!, nextSelectProps)) {
        return;
      }

      selectProps = nextSelectProps;
      forceUpdate();
    });
  }, []);

  return selectProps;
}

function connect<S extends DataObject, R extends DataObject>(
  state: ObserveStateInstance<S>,
  selector: SelectToProps<S, R>
) {
  return function <P extends object>(Comp: ComponentType<P>) {
    return (props: Omit<P, keyof R>) => {
      const selectProps = useConnect(state, selector, props);

      // @ts-ignore
      return <Comp {...props} {...selectProps} />;
    };
  };
}

function connectWithRef<S extends DataObject, R extends DataObject>(
  state: ObserveStateInstance<S>,
  selector: SelectToProps<S, R>
) {
  return function <P extends object>(Comp: ComponentType<P>) {
    return forwardRef((props: Omit<P, keyof R>, ref) => {
      const selectProps = useConnect(state, selector, props);

      // @ts-ignore
      return <Comp {...props} {...selectProps} ref={ref} />;
    });
  };
}

export { connect, connectWithRef };
