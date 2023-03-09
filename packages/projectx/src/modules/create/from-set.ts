import { defineServiceProperty, isFunction, Properties } from "../../shared";

import { createObserver, interceptor } from "../../components";

import { create } from "./create";
import {
  getDecomposeScheme,
  getMainObserver,
  getSchemaChildren,
} from "./utils";

interface Self<V> {
  values: Set<V>;
  observers: Map<V, Observer>;
  schema: Schema;
  mainObserver: Observer;
  root: boolean;
}

function getTraps<K, V>(self: Self<V>) {
  function reportMain() {
    if (self.root) {
      interceptor.handler(self.mainObserver);
    }
  }

  function getSet() {
    reportMain();

    self.observers.forEach((observer) => interceptor.handler(observer));

    return self.values;
  }

  return {
    has(value: V) {
      reportMain();

      const observer = self.observers.get(value);
      if (observer) {
        interceptor.handler(observer);
      }

      return self.values.has(value);
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
    delete(value: V) {
      const observer = self.observers.get(value);
      if (observer) {
        observer.dispose();
        self.observers.delete(value);
        self.mainObserver.emit();
      }

      return self.values.delete(value);
    },
    add(value: V, res: Set<V>) {
      let observer = self.observers.get(value);
      if (observer) {
        observer.emit();
      } else {
        observer = createObserver();

        self.observers.set(value, observer);
        self.mainObserver.emit();
        self.values.add(
          create(value, getSchemaChildren(self.schema, value as any), observer)
        );
      }

      return res;
    },
    getSet,
    forEach(callbackfn: (a: V, b: V, set: Set<V>) => void) {
      reportMain();

      self.values.forEach((a, b) => {
        interceptor.handler(self.observers.get(a)!);
        callbackfn(a, b, self.values);
      });
    },
  };
}

type PickMethods =
  | "clear"
  | "delete"
  | "forEach"
  | "add"
  | "values"
  | "has"
  | "entries"
  | "values";

function createFromSet<V>(
  target: Set<V>,
  parent?: Observer,
  schemaArg: Schema | Properties = {}
): Set<V> {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const values = new Set<V>();
  const observers = new Map<V, Observer>();
  for (const value of target) {
    values.add(value);
    observers.set(value, createObserver());
  }

  const { root, mainObserver } = getMainObserver(parent);
  const traps = getTraps({
    observers,
    values,
    mainObserver,
    schema,
    root,
  });

  let proxy: Set<V>;

  const methods: Pick<Set<V>, PickMethods> = {
    clear: traps.clear,
    delete: traps.delete,
    add: (value: V) => traps.add(value, proxy),
    values: () => traps.getSet().values(),
    forEach: traps.forEach,
    has: traps.has,
    entries: () => traps.getSet().entries(),
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

export { createFromSet };
