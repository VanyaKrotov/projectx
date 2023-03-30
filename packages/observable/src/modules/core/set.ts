import { createObserver, interceptor } from "../../components";
import { snapshot } from "../snapshot";

import { makeObservable } from "./common";
import { getMainObserver } from "./utils";

function makeObservableSet<V>(target: Set<V>, parent?: Observer): Set<V> {
  const observers = new Map<V, Observer>();
  const mainObserver = getMainObserver(parent);

  const values = [];
  for (const value of target) {
    const observer = createObserver();
    const observable = makeObservable(value, observer);

    values.push(observable);
    observers.set(observable, observer);
  }

  return new (class extends Set<V> {
    public get _observers() {
      return observers;
    }

    public get _observer() {
      return mainObserver;
    }

    public get size() {
      interceptor.handler(mainObserver);

      return super.size;
    }

    public _snapshot() {
      const result = new Set();
      super.forEach((value) => result.add(snapshot(value)));

      return result;
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
      const observer = observers.get(value) || createObserver();
      const observable = makeObservable(value, observer);
      const result = super.add(observable);

      observers.set(observable, observer);
      mainObserver.emit();

      return result;
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
  })(values);
}

export { makeObservableSet };
