import { FC } from "react";

import { DataObject, ObserveStateInstance } from "../../../state/src";

export interface ObserveProps<S extends DataObject, R> {
  state: ObserveStateInstance<S>;
  selector: (data: S) => R;
  children: FC<{ data: R }>;
}

export interface SelectToProps<
  T extends DataObject,
  R extends DataObject,
  TOwnProps extends DataObject = {}
> {
  (state: ObserveStateInstance<T>, ownProps: TOwnProps): R;
}
