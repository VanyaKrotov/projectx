import { defineServiceProperty, isFunction, Properties } from "../../shared";

import { interceptor, createObserver } from "../../components";

import { create } from "./create";
import {
  getDecomposeScheme,
  getMainObserver,
  getSchemaChildren,
} from "./utils";

const GET_METHODS = new Set<string | symbol>([
  "join",
  "entries",
  "values",
  "toJSON",
]);

function createFromArray<T>(
  target: Array<T>,
  parent?: Observer,
  schemaArg: Schema = {}
): Array<T> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const { mainObserver, root } = getMainObserver(parent);

  function observable(...items: T[]): [T[], Observer[]] {
    const arr = [];
    const obs = [];

    for (let i = 0; i < items.length; i++) {
      const sh = getSchemaChildren(schema, i);
      let value = items[i];
      if (sh !== Properties.none) {
        const observer = createObserver();

        obs.push(observer);

        value = create(value, schema, observer);
      }

      arr.push(value);
    }

    return [arr, obs];
  }

  const [items, observers] = observable(...target);

  const values = new (class extends Array<T> {
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
      const obs = observers[index];
      if (obs) {
        interceptor.handler(obs);
      }

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
      interceptor.handler(mainObserver, ...observers);

      return super.entries();
    }

    public pop(): T | undefined {
      const result = super.pop();
      if (result) {
        observers.pop()?.dispose();
        mainObserver.emit();
      }

      return result;
    }

    public shift(): T | undefined {
      const result = super.shift();
      if (result) {
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
      const index = super.findIndex(predicate, thisArg);
      if (index === -1) {
        return undefined;
      }

      interceptor.handler(observers[index]);

      return this[index];
    }

    public findIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): number {
      const index = super.findIndex(predicate, thisArg);
      if (index !== -1) {
        interceptor.handler(observers[index]);
      }

      return index;
    }

    public join(separator?: string): string {
      interceptor.handler(mainObserver, ...observers);

      return super.join(separator);
    }

    public values(): IterableIterator<T> {
      interceptor.handler(mainObserver, ...observers);

      return super.values();
    }

    public splice(start: number, deleteCount?: number): T[];
    public splice(start: number, deleteCount?: number, ...items: T[]): T[];
    public splice(start: number, deleteCount?: number, ...rest: T[]): T[] {
      const [items, obs] = observable(...rest);
      const result = super.splice(start, deleteCount as number, ...items);
      const _observers = observers.splice(start, deleteCount as number, ...obs);

      _observers.forEach((observer) => observer.dispose());

      return result;
    }

    public includes(searchElement: T, fromIndex?: number | undefined): boolean {
      interceptor.handler(mainObserver);

      return super.includes(searchElement, fromIndex);
    }
  })(...items);

  defineServiceProperty(values, true);

  return new Proxy(values, {
    deleteProperty(target, p) {
      const index = Number(p);
      if (Number.isNaN(index)) {
        return false;
      }

      if (!target.splice(index, 1).length) {
        return false;
      }

      const observer = observers.at(index);
      if (observer) {
        observer.dispose();
        mainObserver.emit();
      }

      observers.splice(index, 1);

      return true;
    },
    get(_target, p) {
      const index = Number(p);
      if (!Number.isNaN(index)) {
        if (observers[index]) {
          interceptor.handler(observers[index]);
        }

        return _target[index];
      }

      const field = Reflect.get(_target, p);
      if (isFunction(field)) {
        return field.bind(_target);
      }

      return field;
    },
    set(_target, p, value) {
      const index = Number(p);
      if (Number.isNaN(index)) {
        return true;
      }

      const update = index in _target;
      let observer;
      if (update) {
        observer = observers.at(index);
      } else {
        observer = createObserver();

        observers[index] = observer;
      }

      _target[index] = create(value, schema, observer);

      if (update) {
        observer!.emit();
      } else {
        mainObserver.emit();
      }

      return true;
    },
  });
}

export { createFromArray };
