import { createObserver } from "../../components";

export function getMainObserver(parent?: Observer) {
  return parent || createObserver();
}
