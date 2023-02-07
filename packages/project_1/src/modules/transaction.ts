import batch from "./batch";

function transaction(callback: VoidFunction): void {
  batch.open();

  callback();

  batch.closeBatch();
}

export { transaction };
