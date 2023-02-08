import { useState } from "react";

export function useForceUpdate(): VoidFunction {
  const [_, setState] = useState([]);

  return () => setState([]);
}
