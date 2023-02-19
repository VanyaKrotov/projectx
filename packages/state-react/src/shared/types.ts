import { FC } from "react";

import { EachObject, StateInstance } from "../../../state/src";

export interface ObserveProps<S extends EachObject, R> {
  state: StateInstance<S>;
  selector: (data: S) => R;
  children: FC<{ data: R }>;
}

export interface SelectToProps<
  T extends EachObject,
  R extends EachObject,
  TOwnProps extends EachObject = {}
> {
  (state: StateInstance<T>, ownProps: TOwnProps): R;
}
