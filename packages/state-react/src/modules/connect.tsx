import React, { ComponentType, forwardRef, useEffect } from "react";

// @ts-ignore
import { EachObject, StateInstance } from "../../../state";

import type { SelectToProps } from "../shared/types";
import { deepEqual, useForceUpdate } from "../shared";

function useConnect<T extends EachObject, R extends EachObject, P extends {}>(
  state: StateInstance<T>,
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

function connect<S extends EachObject, R extends EachObject>(
  state: StateInstance<S>,
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

function connectWithRef<S extends EachObject, R extends EachObject>(
  state: StateInstance<S>,
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
