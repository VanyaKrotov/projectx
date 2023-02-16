import { observeOf } from "../../observe-of";

import SetManager from "./set-manager";

export function clear<T>(self: SetManager<T>) {
  if (!self.target.size) {
    return;
  }

  const prev = self.snapshot;
  self.disposeManagers();
  self.target.clear();

  self.emit("compression", {
    current: self.target,
    prev,
  });
}

export function deleteValue<T>(value: T, self: SetManager<T>): boolean {
  const prev = self.snapshot;
  const manager = self.getByValue(value);
  if (manager) {
    manager.dispose();
    self.values.delete(manager);
  }

  const result = self.target.delete(value);
  if (result) {
    self.emit("compression", {
      current: self.target,
      prev,
    });
  }

  return result;
}

export function add<T>(value: T, self: SetManager<T>) {
  const manager = self.getByValue(value);
  if (manager) {
    return self.proxy;
  }

  const prev = self.snapshot;
  self.values.add(
    observeOf(value, { path: self.joinToPath(self.target.size) })
  );
  self.target.add(value);

  self.emit("expansion", { current: self.target, prev });

  return self.proxy;
}

function getSetFromValues<T>(self: SetManager<T>): Set<T> {
  const set = new Set<T>();
  for (const manager of self.values) {
    set.add(manager.get());
  }

  return set;
}

export function getSet<T>(self: SetManager<T>) {
  const set = getSetFromValues(self);
  if (!set.size) {
    self.reportUsage();
  }

  return set;
}

export function forEach<T>(
  callbackfn: (v: T, k: T, set: Set<T>) => void,
  self: SetManager<T>
) {
  for (const manager of self.values) {
    const value = manager.get();
    callbackfn(value, value, self.proxy);
  }

  if (!self.values.size) {
    self.reportUsage();
  }
}
