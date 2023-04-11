class BatchManager {
  private readonly batches: Set<VoidFunction>[] = [];

  public open(): void {
    this.batches.push(new Set<VoidFunction>());
  }

  public action(handler: VoidFunction): void {
    if (!this.batches.length) {
      return handler();
    }

    this.batches[this.batches.length - 1].add(handler);
  }

  public close(): void {
    const batch = this.batches.pop();
    if (!batch) {
      return;
    }

    batch.forEach((handler) => handler());
  }
}

export { BatchManager };
