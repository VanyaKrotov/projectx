import {
  getAllObjectFields,
  isFunction,
  isGetter,
  isObjectOfClass,
} from "../../shared";

import { createObserver, interceptor } from "../../components";

import { createReaction } from "../reaction";
import { makeObservable } from "./common";
import { getMainObserver } from "./utils";
import { snapshot } from "../snapshot";

type Target<T> = T & Inner<T>;

interface Computed<T = unknown> {
  (): T;
  dispose(): void;
}

interface Inner<T> {
  get _observer(): Observer;
  get _observers(): Map<string | symbol, Observer>;
  get _values(): Map<string | symbol, unknown>;
  get _computeds(): Map<string | symbol, Computed>;
  _snapshot(): T;
}

function createComputed<T = unknown>(
  descriptor: PropertyDescriptor,
  observer: Observer
): Computed<T> {
  let memo: { value?: T } = {};
  const reaction = createReaction(() => {
    delete memo.value;

    observer.emit();
  });

  const result = (): T => {
    interceptor.handler(observer);
    if ("value" in memo) {
      return memo.value!;
    }

    reaction.start();

    memo.value = descriptor.get!();

    reaction.end();

    return memo.value!;
  };

  result.dispose = () => {
    reaction.dispose();
    memo = { value: undefined };
    observer.dispose();
  };

  return result;
}

function defineProp<T>(
  key: string | symbol,
  descriptor: PropertyDescriptor,
  target: Target<T>
) {
  const { value, configurable = true, enumerable = true } = descriptor;
  if (isFunction(value)) {
    return Object.defineProperty(target, key, {
      configurable,
      enumerable,
      value,
    });
  }

  const observer = createObserver();

  target._observers.set(key, observer);

  if (isGetter(descriptor)) {
    const computed = createComputed(
      { ...descriptor, get: descriptor.get!.bind(target) },
      observer
    );

    target._computeds.set(key, computed);

    return Object.defineProperty(target, key, {
      configurable,
      enumerable,
      get: computed,
    });
  }

  if (value !== undefined) {
    target._values.set(key, makeObservable(value, observer));
  }

  const get = () => {
    interceptor.handler(target._observer);

    return target._values.get(key);
  };

  const set = (value: unknown) => {
    target._values.set(key, makeObservable(value, observer));
    target._observer.emit();

    return true;
  };

  return Object.defineProperty(target, key, {
    configurable,
    enumerable,
    get,
    set,
  });
}

function makeObservableObject<T extends object>(
  target: T,
  parent?: Observer
): T {
  const mainObserver = getMainObserver(parent);
  const properties = getAllObjectFields(target);
  const isPlainObject = isObjectOfClass(target);
  const values = new Map<string | symbol, unknown>();
  const observers = new Map<string | symbol, Observer>();
  const computeds = new Map<string | symbol, Computed>();

  const result = new (class extends (target.constructor as any) {
    public get _values() {
      return values;
    }

    public get _computeds() {
      return computeds;
    }

    public get _observer() {
      return mainObserver;
    }

    public get _observers() {
      return observers;
    }

    public _snapshot() {
      const res = {};

      values.forEach((value, key) => {
        // @ts-ignore
        res[key] = snapshot(value);
      });

      return res;
    }
  })() as Target<T>;

  for (const key in properties) {
    defineProp(key, properties[key], result);
  }

  if (isPlainObject) {
    return result;
  }

  return new Proxy(result, {
    defineProperty(_target, key, descriptor) {
      const defineResult = Boolean(defineProp(key, descriptor, result));
      if (defineResult) {
        mainObserver.emit();
      }

      return defineResult;
    },
    deleteProperty(_target, key) {
      const deleteResult = delete result[key as keyof T];
      if (!deleteResult) {
        return false;
      }

      const computed = computeds.get(key);
      if (computed) {
        computed.dispose();
        computeds.delete(key);
      } else {
        observers.get(key)?.dispose();
        values.delete(key);
      }

      observers.delete(key);

      mainObserver.emit();

      return true;
    },
  });
}

export { makeObservableObject };
