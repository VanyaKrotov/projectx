import React, { ComponentType, forwardRef, useEffect, useState } from "react";
import { DataObject, ObserveStateInstance, PathTree } from "projectx.state";

import { deepEqual, getValues } from "../shared";
import { useStateOrDefault } from "./hooks";

interface SelectToProps<
  T extends DataObject,
  R extends DataObject,
  TOwnProps extends DataObject = {}
> {
  (state: ObserveStateInstance<T>, ownProps: TOwnProps): R;
}

function useConnect<T extends DataObject, R extends DataObject, P extends {}>(
  selector: SelectToProps<T, R>,
  props: P,
  state?: ObserveStateInstance<T>
) {
  const workState = useStateOrDefault(state);
  const [selectProps, setSelectProps] = useState<R>(() =>
    selector(workState, props)
  );

  useEffect(() => {
    return workState.reaction([], () => {
      const nextSelectProps = selector(workState, props);
      if (deepEqual(selectProps!, nextSelectProps)) {
        return;
      }

      setSelectProps(nextSelectProps);
    });
  }, []);

  return selectProps;
}

function connect<R extends DataObject, S extends DataObject>(
  selector: SelectToProps<S, R>,
  state?: ObserveStateInstance<S>
) {
  return function <P extends object>(Comp: ComponentType<P>) {
    return (props: Omit<P, keyof R>) => {
      const selectProps = useConnect(selector, props, state);

      // @ts-ignore
      return <Comp {...props} {...selectProps} />;
    };
  };
}

function connectWithRef<R extends DataObject, S extends DataObject>(
  selector: SelectToProps<S, R>,
  state?: ObserveStateInstance<S>
) {
  return function <P extends object>(Comp: ComponentType<P>) {
    return forwardRef((props: Omit<P, keyof R>, ref) => {
      const selectProps = useConnect(selector, props, state);

      // @ts-ignore
      return <Comp {...props} {...selectProps} ref={ref} />;
    });
  };
}

function useConnectWatch<R>(
  tree: PathTree,
  paths: string[],
  state?: ObserveStateInstance
): R {
  const workState = useStateOrDefault<ObserveStateInstance>(state);
  const [selectProps, setSelectProps] = useState<R>(() =>
    getValues(workState, paths)
  );

  useEffect(
    () =>
      workState.watch(tree, () => setSelectProps(getValues(workState, paths))),
    [paths, workState]
  );

  return selectProps;
}

function connectWatch<R extends DataObject, S extends DataObject>(
  paths: string[],
  state?: ObserveStateInstance<S>
) {
  const tree = new PathTree(paths);

  return function <P extends object>(Comp: ComponentType<P>) {
    return (props: Omit<P, keyof R>) => {
      const selectProps = useConnectWatch(tree, paths, state);

      // @ts-ignore
      return <Comp {...props} {...selectProps} />;
    };
  };
}

function connectWatchWithRef<R extends DataObject, S extends DataObject>(
  paths: string[],
  state?: ObserveStateInstance<S>
) {
  const tree = new PathTree(paths);

  return function <P extends object>(Comp: ComponentType<P>) {
    return forwardRef((props: Omit<P, keyof R>, ref) => {
      const selectProps = useConnectWatch(tree, paths, state);

      // @ts-ignore
      return <Comp {...props} {...selectProps} ref={ref} />;
    });
  };
}

export { connect, connectWithRef, connectWatch, connectWatchWithRef };
