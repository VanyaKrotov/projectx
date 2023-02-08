interface Event<V = unknown> {
  uid: string;
  path: (string | symbol)[];
  objectId: string;
  key: string | symbol;
  current: V;
  prev: V;
}

interface Listener<V = unknown> {
  (event: Event<V>): void;
}

export interface ObserverInstance<T> {
  listen(listener: Listener<T>): VoidFunction;
  emit(event: Event<T>): void;
}
