declare module "types" {
  //#region observer

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

  //#endregion

  //#region state

  type StateMutator<T> = Partial<T> | ((prev: T) => T);

  export interface StateInstance<T> extends ObserverInstance<unknown> {
    state: T;
    change(change: StateMutator<T>, afterChange?: VoidFunction): void;
  }

  //#endregion

  //#region watch

  export interface WatchOptions<T = unknown> {
    resolver: (a: T, b: T) => boolean;
    initCall: boolean;
  }

  //#endregion

  //#region common

  type CombineState<T extends Record<string, State>> = {
    [P in keyof T]: T[P]["state"];
  };

  //#endregion
}
