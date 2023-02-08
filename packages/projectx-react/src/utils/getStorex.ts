import { STOREX_WINDOW_KEY } from "../constants";
import { WindowStorex } from "../types";

export default function getStorex(): WindowStorex {
  const store = (window as any)[STOREX_WINDOW_KEY];
  if (!store) {
    throw new Error("[storex] Global observer is not found");
  }

  return store as WindowStorex;
}
