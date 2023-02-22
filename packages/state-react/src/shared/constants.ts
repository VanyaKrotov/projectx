import { createContext } from "react";

import { ObserveStateInstance } from "../../../state/src";

export const DefaultContext = createContext<ObserveStateInstance | undefined>(
  undefined
);
