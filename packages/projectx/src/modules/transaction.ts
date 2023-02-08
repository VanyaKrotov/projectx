import { batch } from "./initialize";

function transaction(callback: VoidFunction): void {
  batch.open();

  callback();

  batch.close();
}

export { transaction };
