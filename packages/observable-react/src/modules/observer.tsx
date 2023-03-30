import React, {
  ComponentType,
  FC,
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  PropsWithoutRef,
  RefAttributes,
} from "react";

import type { LocalObserverProps } from "../shared/types";
import { getComponentName } from "../shared";

import { useObserveComponent } from "./use-observe-component";

function observer<P extends object>(Comp: ComponentType<P>): FC<P> {
  return (props: P) => {
    return useObserveComponent<P>(
      () => <Comp {...props} />,
      getComponentName(Comp)
    );
  };
}

function observerWithRef<T, P extends object>(
  Comp: ForwardRefRenderFunction<T, P>
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
  return forwardRef((props: P, ref) => {
    return useObserveComponent<P>(
      () => <Comp {...props} ref={ref} />,
      getComponentName(Comp)
    );
  });
}

function LocalObserver<P extends object>({ children }: LocalObserverProps<P>) {
  return useObserveComponent(children);
}

export { observer, LocalObserver, observerWithRef };
