import {
  Event,
  Listener,
  ObserverInstance,
  ObserverWithTypeInstance,
} from "shared/types";

class Observer<T> implements ObserverInstance<T> {
  private listeners = new Set<Listener<T>>();

  public listen(listener: Listener<T>): VoidFunction {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: Event<T>): void {
    for (const listener of this.listeners) {
      if (listener(event)) {
        break;
      }
    }
  }
}

class ObserverWithType<T, E extends string>
  implements ObserverWithTypeInstance<T, E>
{
  private readonly listenerMap = new Map<E | "all", ObserverInstance<T>>();
  protected observable = true;

  public listen(type: E | E[], callback: Listener<T>): VoidFunction {
    if (!this.observable) {
      return () => {};
    }

    if (Array.isArray(type)) {
    }

    const unlisten: Function[] = [];
    const types = Array.isArray(type) ? type : [type];
    for (const eachType of types) {
      const listeners = this.listenerMap.get(eachType) || new Observer<T>();

      this.listenerMap.set(eachType, listeners);

      unlisten.push(listeners.listen(callback));
    }

    return () => {
      unlisten.forEach((fn) => fn());
    };
  }

  public emit(type: E, event: Event<T>): void {
    if (!this.observable || event.current === event.prev) {
      return;
    }

    const listeners = this.listenerMap.get(type);
    const allListeners = this.listenerMap.get("all");
    if (listeners) {
      listeners.emit(event);
    }

    if (allListeners) {
      allListeners.emit(event);
    }
  }
}

export default Observer;
export { ObserverWithType };
