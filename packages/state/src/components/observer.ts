import { PathTreeNode } from "./path-tree";

export interface Event<D = object> {
  changeTree: PathTreeNode;
  detail: D;
}

export interface Listener<D> {
  (event: Event<D>): void | boolean;
}

abstract class Observer<T extends object> {
  private readonly listeners = new Set<Listener<T>>();

  public listen(listener: Listener<T>): VoidFunction {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: Event<T>): void {
    for (const listener of this.listeners) {
      if (listener(event)) {
        return;
      }
    }
  }

  public dispose(): void {
    this.listeners.clear();
  }
}

export { Observer };
