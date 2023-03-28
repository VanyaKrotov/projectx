import { defineServiceProperty, Properties } from "../../shared";

import { createObserver, interceptor } from "../../components";

import { create } from "./create";
import { getDecomposeScheme, getMainObserver } from "./utils";

function createFromSet<V>(
  target: Set<V>,
  parent?: Observer,
  schemaArg: Schema | Properties = {}
): Set<V> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const observers = new Map<V, Observer>();
  const { mainObserver } = getMainObserver(parent);
  const result = new (class extends Set<V> {
    constructor() {
      super();

      for (const value of target) {
        super.add(value);
        observers.set(value, createObserver());
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

      return super.clear();
    }

    public delete(value: V): boolean {
      mainObserver.emit();

      return super.delete(value);
    }

    public add(value: V): this {
      let observer = observers.get(value);
      if (!observer) {
        observer = createObserver();

        observers.set(value, observer);
      }

      mainObserver.emit();

      return super.add(create(value, schema, observer));
    }

    public values(): IterableIterator<V> {
      interceptor.handler(mainObserver);

      return super.values();
    }

    public forEach(
      callbackfn: (value: V, value2: V, set: Set<V>) => void,
      thisArg?: any
    ): void {
      interceptor.handler(mainObserver);

      super.forEach(callbackfn, thisArg);
    }

    public entries(): IterableIterator<[V, V]> {
      interceptor.handler(mainObserver);

      return super.entries();
    }

    public has(value: V): boolean {
      interceptor.handler(mainObserver);

      return super.has(value);
    }

    public keys(): IterableIterator<V> {
      interceptor.handler(mainObserver);

      return super.keys();
    }
  })();

  defineServiceProperty(result, true);

  return result;
}

export { createFromSet };
