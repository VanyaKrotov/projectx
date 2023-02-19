abstract class Observer<T = unknown> implements Observer.ObserverInstance<T> {
  readonly #listeners = new Set<Observer.Listener<T>>();

  public listen(listener: Observer.Listener<T>): VoidFunction {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
    };
  }

  public emit(event: Observer.Event<T>): void {
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

export default Observer;
