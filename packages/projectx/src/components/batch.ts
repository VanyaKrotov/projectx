function createBatchManager() {
  const batches: Set<VoidFunction>[] = [];

  return {
    open: () => {
      batches.push(new Set<VoidFunction>());
    },

    action: (handler: VoidFunction): void => {
      if (!batches.length) {
        return handler();
      }

      batches[batches.length - 1].add(handler);
    },

    close: () => {
      const batch = batches.pop();
      if (!batch) {
        return;
      }

      batch.forEach((handler) => handler());
    },
  };
}

export { createBatchManager };
