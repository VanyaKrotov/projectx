import React, { FC } from "react";

import { useSelect, useWatch } from "./hooks";

import { DataObject, ObserveStateInstance } from "projectx.state";

interface ObserveProps<S extends DataObject, R> {
  state?: ObserveStateInstance<S>;
  children: FC<{ data: R }>;
}

interface ObservePropsSelector<S extends DataObject, R>
  extends ObserveProps<S, R> {
  selector: (data: ObserveStateInstance<S>) => R;
}

interface ObservePropsWatch<S extends DataObject, R>
  extends ObserveProps<S, R> {
  watch: string[];
}

function SelectObserve<R, S extends DataObject = DataObject>({
  selector,
  state,
  children: Comp,
}: ObservePropsSelector<S, R>) {
  const data = useSelect<R, S>(selector, state);

  return <Comp data={data} />;
}

function WatchObserve<R extends unknown[], S extends DataObject = DataObject>({
  watch,
  state,
  children: Comp,
}: ObservePropsWatch<S, R>) {
  const data = useWatch<R, S>(watch, state);

  return <Comp data={data} />;
}

export { SelectObserve, WatchObserve };
