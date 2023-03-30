import { createObserver, interceptor } from "../../components";
import { snapshot } from "../snapshot";

import { makeObservable } from "./common";
import { getMainObserver } from "./utils";

function makeObservableMap<K, V>(
  target: Map<K, V>,
  parent?: Observer
): Map<K, V> {
  const mainObserver = getMainObserver(parent);
  const entries = Array.from(target.entries());
  const observers = new Map<K, Observer>(
    entries.map(([key]) => [key, createObserver()])
  );

  return new (class extends Map<K, V> {
    public get _observers(): Map<K, Observer> {
      return observers;
    }

    public get _observer(): Observer {
      return mainObserver;
    }

    public get size() {
      interceptor.handler(mainObserver);

      return super.size;
    }

    public clear(): void {
      mainObserver.emit();
      observers.forEach((observer) => observer.dispose());
      observers.clear();

      super.clear();
    }

    public delete(key: K): boolean {
      const result = super.delete(key);
      if (result) {
        mainObserver.emit();
        observers.get(key)?.dispose();
        observers.delete(key);
      }

      return result;
    }

    public get(key: K): V | undefined {
      interceptor.handler(mainObserver);

      return super.get(key);
    }

    public set(key: K, value: V): this {
      let observer = observers.get(key);
      if (!observer) {
        observer = createObserver();

        observers.set(key, observer);
      }

      mainObserver.emit();

      return super.set(key, makeObservable(value, observer));
    }

    public values(): IterableIterator<V> {
      interceptor.handler(mainObserver);

      return super.values();
    }

    public entries(): IterableIterator<[K, V]> {
      interceptor.handler(mainObserver);

      return super.entries();
    }

    public forEach(
      callbackfn: (value: V, key: K, map: Map<K, V>) => void,
      thisArg?: any
    ): void {
      interceptor.handler(mainObserver);

      return super.forEach(callbackfn, thisArg);
    }

    public has(key: K): boolean {
      interceptor.handler(mainObserver);

      return super.has(key);
    }

    public keys(): IterableIterator<K> {
      interceptor.handler(mainObserver);

      return super.keys();
    }

    public _snapshot() {
      const res = new Map();
      super.forEach((value, key) => res.set(key, snapshot(value)));

      return res;
    }
  })(
    entries.map(([key, value]) => [
      key,
      makeObservable(value, observers.get(key)),
    ])
  );
}

export { makeObservableMap };
