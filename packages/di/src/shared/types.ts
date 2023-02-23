export type GetConstructorArgs<T> = T extends new (...args: infer U) => unknown
  ? U
  : never;

export interface Constructable<T, A = T> {
  new (...args: GetConstructorArgs<A>): T;
  prototype: T;
  name: string;
}

export type Target<T = any> = Constructable<T> | string;

export interface Profile<T extends object> {
  target: Target;
  instance: T;
}

export interface ProviderInstance {
  unregister<T extends object>(target: Target<T>): boolean;
  register<T extends object>(target: Profile<T>): void;
  register<T extends object>(target: Constructable<T>): void;
  inject<T extends object>(target: Target<T>): T | null;
  injectAfterCreate<T extends object>(target: Target<T>): Promise<T>;
  dispose(): void;
}
