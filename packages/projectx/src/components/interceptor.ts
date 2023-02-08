import {
  InterceptorEvent,
  InterceptorListener,
  InterceptorInstance,
} from "shared/types";

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

    Array.from(this.listeners).pop()!(event);
  }
}

export default Interceptor;
