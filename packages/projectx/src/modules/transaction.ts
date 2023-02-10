import { batch } from "../components";

function transaction(callback: VoidFunction): void {
  batch.open();

  callback();

  batch.close();
}

export { transaction };
