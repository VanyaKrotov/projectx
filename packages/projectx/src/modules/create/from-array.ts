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
  const observers = new Map<number, Observer>();
  const values: T[] = [];
  for (let index = 0; index < target.length; index++) {
    const sh = getSchemaChildren(schema, index);
    let val = target[index];
    if (sh !== Properties.none) {
      const observer = createObserver();

      observers.set(index, observer);

      val = create(val, schema, observer);
    }

    values.push(val);
  }

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

      const observer = observers.get(index);
      if (observer) {
        observer.dispose();
        mainObserver.emit();
      }

      observers.delete(index);

      return true;
    },
    get(_target, p, proxy) {
      const index = Number(p);
      if (!Number.isNaN(index)) {
        interceptor.handler(observers.get(index)!);

        return _target[index];
      }

      if (root && GET_METHODS.has(p)) {
        interceptor.handler(mainObserver);
      }

      const field = Reflect.get(_target, p);
      if (isFunction(field)) {
        return field.bind(proxy);
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
        observer = observers.get(index);
      } else {
        observer = createObserver();

        observers.set(index, observer);
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
