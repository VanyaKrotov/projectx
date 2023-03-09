import { defineServiceProperty, isFunction, Properties } from "../../shared";

import { createObserver, interceptor } from "../../components";

import { create } from "./create";
import {
  getDecomposeScheme,
  getMainObserver,
  getSchemaChildren,
} from "./utils";

interface Self<K, V> {
  values: Map<K, V>;
  observers: Map<K, Observer>;
  schema: Schema;
  mainObserver: Observer;
  root: boolean;
}

function getTraps<K, V>(self: Self<K, V>) {
  function reportMain() {
    if (self.root) {
      interceptor.handler(self.mainObserver);
    }
  }

  function getMap() {
    reportMain();

    self.observers.forEach((observer) => interceptor.handler(observer));

    return self.values;
  }

  return {
    has(key: K) {
      reportMain();

      const observer = self.observers.get(key);
      if (observer) {
        interceptor.handler(observer);
      }

      return self.values.has(key);
    },
    clear() {
      if (!self.values.size) {
        return;
      }

      self.observers.forEach((observer) => observer.dispose());
      self.values.clear();
      self.observers.clear();
      self.mainObserver.emit();
    },
    delete(key: K) {
      const observer = self.observers.get(key);
      if (observer) {
        observer.dispose();
        self.observers.delete(key);
        self.mainObserver.emit();
      }

      return self.values.delete(key);
    },
    set(key: K, value: V, res: Map<K, V>) {
      let observer = self.observers.get(key);
      if (observer) {
        observer.emit();
      } else {
        observer = createObserver();

        self.observers.set(key, observer);
        self.mainObserver.emit();
      }

      self.values.set(
        key,
        create(value, getSchemaChildren(self.schema, key as any), observer)
      );

      return res;
    },
    getMap,
    forEach(callbackfn: (v: V, k: K, set: Map<K, V>) => void) {
      reportMain();

      for (const [key, value] of self.values) {
        interceptor.handler(self.observers.get(key)!);
        callbackfn(value, key, self.values);
      }
    },
    get(key: K) {
      reportMain();

      const observer = self.observers.get(key);
      if (observer) {
        interceptor.handler(observer);
      }

      return self.values.get(key);
    },
  };
}

type PickMethods =
  | "clear"
  | "delete"
  | "entries"
  | "forEach"
  | "get"
  | "set"
  | "has"
  | "values";

function createFromMap<K, V>(
  target: Map<K, V>,
  parent?: Observer,
  schemaArg: Schema | Properties = {}
): Map<K, V> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const values = new Map<K, V>();
  const observers = new Map<K, Observer>();
  for (const [key, value] of target) {
    values.set(key, value);
    observers.set(key, createObserver());
  }

  const { root, mainObserver } = getMainObserver(parent);
  const traps = getTraps({
    observers,
    values,
    mainObserver,
    schema,
    root,
  });

  let proxy: Map<K, V>;

  const methods: Pick<Map<K, V>, PickMethods> = {
    clear: traps.clear,
    delete: traps.delete,
    get: traps.get,
    set: (key: K, value: V) => traps.set(key, value, proxy),
    values: () => traps.getMap().values(),
    entries: () => traps.getMap().entries(),
    forEach: traps.forEach,
    has: traps.has,
  };

  defineServiceProperty(values, true);

  return (proxy = new Proxy(values, {
    get(target, key, receiver) {
      const method = Reflect.get(methods, key);
      if (method) {
        return method;
      }

      const field = Reflect.get(target, key);
      if (isFunction(field)) {
        return field.bind(receiver);
      }

      return field;
    },
  }));
}

export { createFromMap };
