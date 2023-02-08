import { useRef } from "react";

function useLocalObservable() {
  const ref = useRef();

  return ref.current;
}

export default useLocalObservable;
