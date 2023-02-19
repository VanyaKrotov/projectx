//#region observer

namespace Observer {
  interface Event<T> {
    current?: T;
    previous?: T;
  }

  interface Listener<T> {
    (event: Event<T>): void | boolean;
  }

  interface ObserverInstance<T> {
    listen(listener: Listener<T>): VoidFunction;
    dispose(): void;
  }
}

//#endregion

//#region state

type StateMutator<T> = Partial<T> | ((prev: T) => T);

interface StateInstance<S = object> {
  data: S;
  change(change: StateMutator<S>, afterChange?: VoidFunction): void;
  reaction<T extends unknown[]>(
    selectors: ((state: S) => unknown)[],
    action: (...args: T) => void,
    options?: Partial<WatchOptions>
  ): VoidFunction;
  dispose(): void;
}

//#endregion

//#region watch

interface WatchOptions<T = unknown> {
  resolver: (a: T, b: T) => boolean;
  initCall: boolean;
}

//#endregion

//#region common

type CombineState<T extends Record<string, State>> = {
  [P in keyof T]: T[P]["data"];
};

//#endregion
