export interface ObserverEvent<T> {
  current?: T;
  previous?: T;
}

export interface ObserverListener<T> {
  (event: ObserverEvent<T>): void | boolean;
}

export interface ObserverInstance<T> {
  listen(listener: ObserverListener<T>): VoidFunction;
  dispose(): void;
}

type StateMutator<T> = Partial<T> | ((prev: T) => T);

export interface StateInstance<S = object> {
  data: S;
  change(change: StateMutator<S>, afterChange?: VoidFunction): void;
  reaction<T extends unknown[]>(
    selectors: ((state: S) => unknown)[],
    action: (...args: T) => void,
    options?: Partial<ReactionOptions>
  ): VoidFunction;
  dispose(): void;
}

export interface EqualResolver<T> {
  (a: T, b: T): boolean;
}

export interface ReactionOptions {
  resolver: EqualResolver<never>;
  initCall: boolean;
}

export type CombineState<T extends Record<string, StateInstance>> = {
  [P in keyof T]: T[P]["data"];
};
