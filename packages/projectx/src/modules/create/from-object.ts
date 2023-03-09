import {
  defineServiceProperty,
  getAllObjectFields,
  isFunction,
  isGetter,
  isObjectOfClass,
  Properties,
} from "../../shared";

import { createObserver, interceptor } from "../../components";

import { createReaction } from "../reaction";
import { create } from "./create";
import {
  getDecomposeScheme,
  getMainObserver,
  getSchemaChildren,
} from "./utils";

interface Self<T> {
  observers: Map<string | symbol, Observer>;
  result: T;
  values: Map<string | symbol, unknown>;
  schema: Schema;
}

function createComputed(descriptor: PropertyDescriptor, observer: Observer) {
  let memo: { value?: unknown } = {};
  const reaction = createReaction(() => {
    delete memo.value;

    observer.emit();
  });

  return {
    get: () => {
      interceptor.handler(observer);
      if ("value" in memo) {
        return memo.value;
      }

      reaction.start();

      memo.value = descriptor.get!();

      reaction.end();

      return memo.value;
    },
    dispose() {
      reaction.dispose();
    },
  };
}

function defineProp<T>(
  key: string | symbol,
  descriptor: PropertyDescriptor,
  self: Self<T>
) {
  const { value, configurable = true, enumerable = true } = descriptor;
  const schema = getSchemaChildren(self.schema, key);
  if (isFunction(value) || schema === Properties.none) {
    return Object.defineProperty(self.result, key, {
      configurable,
      enumerable,
      value,
    });
  }

  const observer = createObserver();

  self.observers.set(key, observer);

  if (isGetter(descriptor)) {
    const computed = createComputed(
      { ...descriptor, get: descriptor.get!.bind(self.result) },
      observer
    );

    return Object.defineProperty(self.result, key, {
      configurable,
      enumerable,
      get: computed.get,
    });
  }

  if (value !== undefined) {
    self.values.set(key, create(value, schema, observer));
  }

  const get = () => {
    interceptor.handler(observer);

    return self.values.get(key);
  };

  const set = (value: unknown) => {
    self.values.set(key, create(value, schema, observer));

    observer.emit();

    return true;
  };

  return Object.defineProperty(self.result, key, {
    configurable,
    enumerable,
    get,
    set,
  });
}

function createFromObject<T extends object>(
  target: T,
  parent?: Observer,
  schemaArg: Schema = {}
): T {
  const { exit, schema } = getDecomposeScheme(schemaArg);
  if (exit) {
    return target;
  }

  const { mainObserver } = getMainObserver(parent);
  const properties = getAllObjectFields(target);
  const result = new (target.constructor as any)();
  const values = new Map<string | symbol, unknown>();
  const observers = new Map<string | symbol, Observer>();

  const self = {
    observers,
    result,
    values,
    schema,
  };

  for (const key in properties) {
    defineProp(key, properties[key], self);
  }

  defineServiceProperty(result, true);

  if (isObjectOfClass(target)) {
    return result;
  }

  return new Proxy(result, {
    defineProperty(_t, key, descriptor) {
      const defineResult = Boolean(defineProp(key, descriptor, self));
      if (defineResult) {
        mainObserver.emit();
      }

      return defineResult;
    },
    deleteProperty(_t, p) {
      const key = p as string;
      const deleteResult = values.delete(key);
      if (deleteResult) {
        observers.get(key)?.dispose();
        observers.delete(key);
        values.delete(key);
        delete result[p as keyof T];
        mainObserver!.emit();
      }

      return deleteResult;
    },
  });
}

export { createFromObject };
