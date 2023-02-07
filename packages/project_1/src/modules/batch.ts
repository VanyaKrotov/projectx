import { BatchInstance } from "shared/types";

class Batch implements BatchInstance {
  private readonly batches: Set<VoidFunction>[] = [];

  public get hasBatch(): boolean {
    return this.batches.length > 0;
  }

  public open(): void {
    this.batches.push(new Set<VoidFunction>());
  }

  public action(handler: VoidFunction): void {
    if (!this.hasBatch) {
      return handler();
    }

    this.batches[this.batches.length - 1].add(handler);
  }

  public closeBatch(): void {
    const batch = this.batches.pop();
    if (!batch) {
      return;
    }

    batch.forEach((handler) => handler());
  }
}

const batch = new Batch();

export default batch;
