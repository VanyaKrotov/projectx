export type GetConstructorArgs<T> = T extends new (...args: infer U) => unknown
  ? U
  : never;

export interface Constructable<T, A = T> {
  new (...args: GetConstructorArgs<A>): T;
  prototype: T;
  name: string;
}

export type Target<T = any> = Constructable<T> | string;

export interface Provider<T extends object> {
  target: Target;
  instance: T;
}
