import type {
  ObserverEvent,
  ObserverInstance,
  ObserverListener,
} from "../shared/types";

abstract class Observer<T = unknown> implements ObserverInstance<T> {
  readonly #listeners = new Set<ObserverListener<T>>();

  public listen(listener: ObserverListener<T>): VoidFunction {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }

  public emit(event: ObserverEvent<T>): void {
    for (const listener of this.#listeners) {
      if (listener(event)) {
        return;
      }
    }
  }

  public dispose(): void {
    this.#listeners.clear();
  }
}

export { Observer };
