import { runAfterScript } from "../shared";

function createObserver(): Observer {
  const listeners = new Set<VoidFunction>();

  return {
    listen: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      listeners.clear();
    },
    emit: () => {
      for (const listener of listeners) {
        runAfterScript(listener);
      }
    },
  };
}

export { createObserver };
