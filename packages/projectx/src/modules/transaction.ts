import { batch } from "../components";

function transaction(callback: VoidFunction): void {
  batch.open();

  try {
    callback();
  } finally {
    batch.close();
  }
}

export { transaction };
