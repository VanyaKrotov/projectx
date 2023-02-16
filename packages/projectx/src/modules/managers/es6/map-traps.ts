import type { Path } from "../../../shared";

import MapManager from "./map-manager";

export function clear<K, T>(self: MapManager<K, T>) {
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

export function deleteByKey<K, T>(key: K, self: MapManager<K, T>) {
  const prev = self.snapshot;
  const manager = self.values.get(key);
  if (manager) {
    manager.dispose();
    self.values.delete(key);
  }

  const result = self.target.delete(key);
  if (result) {
    self.emit("compression", {
      current: self.target,
      prev,
    });
  }

  return result;
}

export function set<K, T>(key: K, value: T, self: MapManager<K, T>) {
  self.setValue(key as Path, value);

  return self.proxy;
}

function getMapFromValues<K, T>(self: MapManager<K, T>) {
  const map = new Map<K, T>();
  for (const [key, manager] of self.values) {
    map.set(key, manager.get());
  }

  return map;
}

export function getMap<K, T>(self: MapManager<K, T>) {
  const map = getMapFromValues(self);
  if (!map.size) {
    self.reportUsage();
  }

  return map;
}

export function forEach<K, T>(
  callbackfn: (v: T, k: K, set: Map<K, T>) => void,
  self: MapManager<K, T>
) {
  for (const [key, manager] of self.values) {
    callbackfn(manager.get(), key, self.proxy);
  }

  if (!self.values.size) {
    self.reportUsage();
  }
}
