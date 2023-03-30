function snapshot<T>(value: T): T;
function snapshot<T>(value: Set<T>): Set<T>;
function snapshot<T>(value: Array<T>): Array<T>;
function snapshot<K, V>(value: Map<K, V>): Map<K, V>;
function snapshot<T extends object>(value: T): T;

function snapshot(value: unknown): unknown {
  if (!value) {
    return value;
  }

  const isObject = typeof value === "object";
  if (isObject) {
    const snapshot = Reflect.get(value, "_snapshot");
    if (snapshot) {
      return snapshot.call(value);
    }
  }

  if (value instanceof Set) {
    return snapshotSet(value);
  }

  if (value instanceof Map) {
    return snapshotMap(value);
  }

  if (Array.isArray(value)) {
    return snapshotArray(value);
  }

  if (isObject) {
    return snapshotObject(value!);
  }

  return value;
}

function snapshotSet<T>(value: Set<T>): Set<T> {
  const result = new Set<T>();
  value.forEach((value) => result.add(snapshot<T>(value)));

  return result;
}

function snapshotMap<K, V>(value: Map<K, V>): Map<K, V> {
  const result = new Map<K, V>();
  value.forEach((value, key) => result.set(key, snapshot(value)));

  return result;
}

function snapshotArray<T>(value: Array<T>): Array<T> {
  return value.map((val) => snapshot(val));
}

function snapshotObject(value: object): object {
  const result: Record<any, unknown> = {};
  for (const key in value) {
    result[key] = snapshot(value[key as keyof typeof value]);
  }

  return result;
}

export { snapshot };
