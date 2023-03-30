import { interceptor } from "../components";
import { getObserver } from "../shared";
import { snapshot } from "./snapshot";

interface Event<T> {
  snapshot(): T;
}

interface Listener<T> {
  (event: Event<T>): void | boolean;
}

function forEachTree<T extends object>(
  target: T,
  callback: (target: T) => void
) {
  if (!target) {
    return;
  }

  callback(target);

  if (target instanceof Map || target instanceof Set || Array.isArray(target)) {
    target.forEach((value) => forEachTree(value, callback));
  } else if (typeof target === "object") {
    for (const key in target) {
      forEachTree(target[key] as any, callback);
    }
  }
}

function subscribe<T extends object>(
  target: T,
  listener: Listener<T>
): VoidFunction {
  const observers = new Set<Observer>();
  const unsubscribe: VoidFunction[] = [];

  const unregister = interceptor.register(() => {});
  forEachTree(target, (item) => {
    const observer = getObserver(item);
    if (observer) {
      observers.add(observer);
    }
  });
  unregister();

  const event = { snapshot: () => snapshot(target) };
  for (const observer of observers) {
    unsubscribe.push(observer.listen(() => listener(event)));
  }

  return () => {
    unsubscribe.forEach((unsubscribe) => unsubscribe());
  };
}

export { subscribe };
