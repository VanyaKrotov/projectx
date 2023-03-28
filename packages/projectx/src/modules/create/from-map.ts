import { defineServiceProperty, Properties } from "../../shared";

import { createObserver, interceptor } from "../../components";

import { create } from "./create";
import { getDecomposeScheme, getMainObserver } from "./utils";

function createFromMap<K, V>(
  target: Map<K, V>,
  parent?: Observer,
  schemaArg: Schema | Properties = {}
): Map<K, V> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const { mainObserver } = getMainObserver(parent);
  const observers = new Map<K, Observer>();

  const result = new (class extends Map<K, V> {
    constructor() {
      super();

      for (const [key, value] of target) {
        super.set(key, value);
        observers.set(key, createObserver());
      }
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

      return super.set(key, create(value, schema, observer));
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
  })();

  defineServiceProperty(result, true);

  return result;
}

export { createFromMap };
