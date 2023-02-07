import { useReducer } from "react";

const useForceUpdate = (): VoidFunction => {
  const [, dispatch] = useReducer(() => [], []);

  return dispatch;
};

export default useForceUpdate;
