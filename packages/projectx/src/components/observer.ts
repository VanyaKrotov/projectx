import type {
  Event,
  Listener,
  ObserverInstance,
  ObserverWithTypeInstance,
} from "../shared";

import { runAfterScript } from "../shared";

export class Observer<T> implements ObserverInstance<T> {
  private listeners = new Set<Listener<T>>();

  public listen(listener: Listener<T>): VoidFunction {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: Event<T>): void {
    for (const listener of this.listeners) {
      runAfterScript(() => listener(event));
    }
  }
}

class ObserverWithType<T, E extends string>
  implements ObserverWithTypeInstance<T, E>
{
  private listenerMap = new Map<E | "all", ObserverInstance<T>>();

  public listen(type: E | E[], callback: Listener<T>): VoidFunction {
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

  public emit(type: Exclude<E, "all">, event: Event<T>): void {
    if (event.current === event.prev) {
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

  public shareListeners(): Map<E | "all", ObserverInstance<T>> {
    return this.listenerMap;
  }

  public receiveListeners(
    listeners: Map<E | "all", ObserverInstance<T>>
  ): void {
    this.listenerMap = listeners;
  }

  public dispose(): void {
    this.listenerMap.clear();
  }
}

export { ObserverWithType };
