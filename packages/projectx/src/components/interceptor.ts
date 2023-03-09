function createInterceptor() {
  const handlers = new Set<(o: Observer) => void>();

  return {
    register: (handler: (o: Observer) => void) => {
      handlers.add(handler);

      return () => {
        handlers.delete(handler);
      };
    },
    handler: (o: Observer) => {
      const handler = Array.from(handlers);
      if (!handler[handler.length - 1]) {
        return;
      }

      return handler[handler.length - 1](o);
    },
  };
}

export { createInterceptor };
