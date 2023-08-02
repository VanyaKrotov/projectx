import { PathTreeNode } from "./path-tree";

export interface Event<D = object> {
  changeTree: PathTreeNode;
  detail: D;
}

export interface Listener<D> {
  (event: Event<D>): void | boolean;
}

interface ListenerModel<D> {
  listener: Listener<D>;
  priority: number;
}

abstract class Observer<T extends object> {
  private listeners = new Set<ListenerModel<T>>();

  public listen(listener: Listener<T>, priority: number = 1): VoidFunction {
    const item = { listener, priority };
    this.listeners.add(item);

    this.listeners = new Set(
      Array.from(this.listeners).sort((a, b) =>
        a.priority > b.priority ? 1 : -1
      )
    );

    return () => {
      this.listeners.delete(item);
    };
  }

  public emit(event: Event<T>): void {
    for (const { listener } of this.listeners) {
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
