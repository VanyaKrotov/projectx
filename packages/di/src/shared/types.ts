export type GetConstructorArgs<T> = T extends new (...args: infer U) => unknown
  ? U
  : never;

export interface Constructable<T, A = T> {
  new (...args: GetConstructorArgs<A>): T;
  prototype: T;
  name: string;
}

export type Target<T extends object = any, TToken extends string = string> =
  | Constructable<T>
  | TToken;

export interface Profile<T extends object, TToken extends string> {
  target: Target<T, TToken>;
  instance: T;
}

export interface ProviderInstance<TToken extends string> {
  unregister<T extends object>(target: Target<T, TToken>): boolean;
  register<T extends object>(target: Profile<T, TToken>): void;
  register<T extends object>(target: Constructable<T>): void;
  inject<T extends object>(target: Target<T, TToken>): T | null;
  injectAfterCreate<T extends object>(target: Target<T, TToken>): Promise<T>;
  dispose(): void;
}
