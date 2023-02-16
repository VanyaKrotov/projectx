import type { Path } from "../../../shared";
import { isFunction } from "../../../shared";

import ArrayManager from "./array-manager";

export function get<T>(key: Path, self: ArrayManager<T>) {
  const index = Number(key);
  if (!Number.isNaN(index)) {
    return self.values[index]?.get();
  }

  const value = self.target[key as keyof Array<T>];
  if (isFunction(value as never)) {
    return (...args: never[]) => (value as Function).call(self.proxy, ...args);
  }

  return value;
}

export function set<T>(key: Path, value: T, self: ArrayManager<T>): boolean {
  const index = Number(key);
  if (!Number.isNaN(index)) {
    return self.setValue(index, value);
  }

  self.target[key as number] = value;

  return true;
}

export function deleteProperty<T>(key: Path, self: ArrayManager<T>): boolean {
  const index = Number(key);
  if (Number.isNaN(index)) {
    return false;
  }

  if (!(index in self.target)) {
    return false;
  }

  const manager = self.values[index];
  const deleteResult = self.target.splice(index, 1).length === 1;
  if (deleteResult) {
    if (manager) {
      self.values.splice(index, 1);
      manager.dispose();
    }
  }

  return deleteResult;
}
