import React, { FC, ReactNode, useContext, useMemo } from "react";

import { ObserveStateInstance } from "projectx.state";

import { DefaultContext } from "../shared";

interface Props {
  state: (parent?: ObserveStateInstance) => ObserveStateInstance;
  children: ReactNode;
}

const StateProvider: FC<Props> = ({ state, children }) => {
  const context = useContext(DefaultContext);
  const value = useMemo(() => state(context), [state, context]);

  return (
    <DefaultContext.Provider value={value}>{children}</DefaultContext.Provider>
  );
};

export { StateProvider };
