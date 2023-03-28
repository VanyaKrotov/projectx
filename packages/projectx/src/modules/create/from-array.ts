import { defineServiceProperty, isFunction } from "../../shared";

import { interceptor, createObserver } from "../../components";

import { create } from "./create";
import { getDecomposeScheme, getMainObserver } from "./utils";

function createFromArray<T>(
  target: Array<T>,
  parent?: Observer,
  schemaArg: Schema = {}
): Array<T> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const { mainObserver } = getMainObserver(parent);

  function observable(...items: T[]): [T[], Observer[]] {
    const arr = [];
    const obs = [];
    for (let i = 0; i < items.length; i++) {
      let value = items[i];
      const observer = createObserver();

      obs.push(observer);

      value = create(value, schema, observer);

      arr.push(value);
    }

    return [arr, obs];
  }

  const [items, observers] = observable(...target);

  const values = new (class extends Array<T> {
    public get length() {
      interceptor.handler(mainObserver);

      return super.length;
    }

    public push(...items: T[]): number {
      const [arr, obs] = observable(...items);
      const result = super.push(...arr);
      observers.push(...obs);

      if (arr.length) {
        mainObserver.emit();
      }

      return result;
    }

    public at(index: number): T | undefined {
      interceptor.handler(mainObserver);

      return super.at(index);
    }

    public concat(...items: ConcatArray<T>[]): T[];
    public concat(...items: (T | ConcatArray<T>)[]): T[];
    public concat(...items: unknown[]): T[] {
      const [array, obs] = observable(...(items as T[]));
      if (obs.length) {
        mainObserver.emit();
      }

      return super.concat(...array);
    }

    public entries(): IterableIterator<[number, T]> {
      interceptor.handler(mainObserver);

      return super.entries();
    }

    public pop(): T | undefined {
      const result = super.pop();
      if (result !== undefined) {
        observers.pop()?.dispose();
        mainObserver.emit();
      }

      return result;
    }

    public shift(): T | undefined {
      const result = super.shift();
      if (result !== undefined) {
        observers.shift()?.dispose();
        mainObserver.emit();
      }

      return result;
    }

    public fill(value: T, start = 0, end = this.length): this {
      for (let index = start; index < end; index++) {
        const obs = observers[index];

        this[index] = create(value, schema, obs);

        obs.emit();
      }

      return this;
    }

    public find(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: unknown
    ): T | undefined {
      interceptor.handler(mainObserver);

      return super.at(super.findIndex(predicate, thisArg));
    }

    public findIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number {
      interceptor.handler(mainObserver);

      return super.findIndex(predicate, thisArg);
    }

    public join(separator?: string): string {
      interceptor.handler(mainObserver);

      return super.join(separator);
    }

    public values(): IterableIterator<T> {
      interceptor.handler(mainObserver);

      return super.values();
    }

    public splice(start: number, deleteCount?: number): T[];
    public splice(start: number, deleteCount?: number, ...items: T[]): T[];
    public splice(start: number, deleteCount?: number, ...rest: T[]): T[] {
      const [items, obs] = observable(...rest);
      const result = super.splice(start, deleteCount as number, ...items);
      const _observers = observers.splice(start, deleteCount as number, ...obs);

      _observers.forEach((observer) => observer.dispose());
      if (result.length) {
        mainObserver.emit();
      }

      return result;
    }

    public includes(searchElement: T, fromIndex?: number | undefined): boolean {
      interceptor.handler(mainObserver);

      return super.includes(searchElement, fromIndex);
    }

    public filter(
      predicate: (value: T, index: number, array: T[]) => boolean,
      thisArg?: any
    ): T[] {
      interceptor.handler(mainObserver);

      return super.filter(predicate, thisArg);
    }

    public keys(): IterableIterator<number> {
      interceptor.handler(mainObserver);

      return super.keys();
    }

    public forEach(
      callbackfn: (value: T, index: number, array: T[]) => void,
      thisArg?: any
    ): void {
      interceptor.handler(mainObserver);

      return super.forEach(callbackfn, thisArg);
    }

    public sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
      interceptor.handler(mainObserver);

      return super.sort(compareFn);
    }

    public some(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any
    ): boolean {
      interceptor.handler(mainObserver);

      return super.some(predicate, thisArg);
    }

    public every(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: any
    ): boolean {
      interceptor.handler(mainObserver);

      return super.every(predicate, thisArg);
    }

    public reduce(
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[]
      ) => T,
      initialValue?: any
    ): T {
      interceptor.handler(mainObserver);

      return super.reduce(callbackfn, initialValue);
    }

    public reduceRight(
      callbackfn: (
        previousValue: T,
        currentValue: T,
        currentIndex: number,
        array: T[]
      ) => T,
      initialValue?: any
    ): T {
      interceptor.handler(mainObserver);

      return super.reduceRight(callbackfn, initialValue);
    }

    public map<U>(
      callbackfn: (value: T, index: number, array: T[]) => U,
      thisArg?: any
    ): U[] {
      interceptor.handler(mainObserver);

      return this.map(callbackfn, thisArg);
    }

    public indexOf(searchElement: T, fromIndex?: number | undefined): number {
      interceptor.handler(mainObserver);

      return super.indexOf(searchElement, fromIndex);
    }

    public lastIndexOf(
      searchElement: T,
      fromIndex?: number | undefined
    ): number {
      interceptor.handler(mainObserver);

      return super.lastIndexOf(searchElement, fromIndex);
    }
  })(...items);

  defineServiceProperty(values, true);

  return new Proxy(values, {
    get(_target, key) {
      const index = Number(key);
      if (!Number.isNaN(index)) {
        interceptor.handler(mainObserver);

        return _target[index];
      }

      const field = Reflect.get(_target, key);

      return isFunction(field) ? field.bind(_target) : field;
    },
    set(_target, key, value) {
      const index = Number(key);
      if (Number.isNaN(index)) {
        return true;
      }

      const observer = index in _target ? observers[index] : createObserver();
      observers[index] = observer;
      _target[index] = create(value, schema, observer);
      mainObserver.emit();

      return true;
    },
  });
}

export { createFromArray };
