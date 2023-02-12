import {
  InterceptorEvent,
  InterceptorListener,
  InterceptorInstance,
} from "../shared";

class Interceptor implements InterceptorInstance {
  private readonly listeners = new Set<InterceptorListener>();

  public register(listener: InterceptorListener): void {
    this.listeners.add(listener);
  }

  public unregister(listener: InterceptorListener): void {
    this.listeners.delete(listener);
  }

  public emit(event: InterceptorEvent): void {
    if (!this.listeners.size) {
      return;
    }

    const reversedListeners = Array.from(this.listeners).reverse();
    for (const listener of reversedListeners) {
      if (!listener(event)) {
        return;
      }
    }
  }
}

export default Interceptor;
