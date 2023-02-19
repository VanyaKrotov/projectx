export function deepEqual<T extends object>(a: T, b: T): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!(key in b) || a[key as keyof T] !== b[key as keyof T]) {
      return false;
    }
  }

  return true;
}
