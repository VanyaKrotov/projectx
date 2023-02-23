import { createContext } from "react";

import { ObserveStateInstance } from "projectx.state";

export const DefaultContext = createContext<ObserveStateInstance | undefined>(
  undefined
);
