function createInterceptor() {
  const listeners = new Set<(o: Observer) => void>();

  return {
    register: (handler: (o: Observer) => void) => {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
    handler: (...observers: Observer[]) => {
      const handlers = Array.from(listeners);
      const handler = handlers[handlers.length - 1];
      if (!handler) {
        return null;
      }

      return observers.forEach(handler);
    },
  };
}

export { createInterceptor };
