export function isEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((item, index) =>
    Array.isArray(item)
      ? isEqualArray(item, arr2[index] as [])
      : arr2.indexOf(item) === index
  );
}
