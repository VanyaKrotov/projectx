import { interceptor } from "../components";

function createObserverManager(action: VoidFunction) {
  const unlisten = new Map<Observer, VoidFunction>();
  let observers = new Set<Observer>();
  let memo = new Set<Observer>();

  return {
    add: (observer: Observer) => {
      if (observers.has(observer)) {
        return;
      }

      observers.add(observer);
      if (!memo.has(observer)) {
        unlisten.set(observer, observer.listen(action));
      } else {
        memo.delete(observer);
      }
    },
    reset: () => {
      memo = observers;
      observers = new Set<Observer>();
    },
    dispose: () => {
      unlisten.forEach((unsubscribe) => unsubscribe());
      unlisten.clear();
      observers.clear();
      memo.clear();
    },
    end: () => {
      for (const obs of memo) {
        unlisten.get(obs)?.();
        unlisten.delete(obs);
      }

      memo.clear();
    },
  };
}

function createReaction(action: VoidFunction) {
  const observers = createObserverManager(action);

  let unregister: VoidFunction;
  const start = () => {
    observers.reset();
    unregister = interceptor.register(observers.add);
  };

  const end = () => {
    observers.end();
    unregister?.();
  };

  return {
    start,
    end,
    syncCaptured: <T>(fn: () => T): T => {
      start();
      let result: T;

      try {
        result = fn();
      } catch (error) {
        console.error(error);
      }

      end();

      return result!;
    },
    dispose: () => {
      end();
      observers.dispose();
    },
  };
}

export { createReaction };
