import { BatchManager } from "../components";

const manager = new BatchManager();

function batch(handler: VoidFunction): void {
  manager.open();

  try {
    handler();
  } finally {
    manager.close();
  }
}

export { batch, manager };
