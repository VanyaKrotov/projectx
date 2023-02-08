//#region observer

export interface Event<V = unknown> {
  current?: V;
  prev?: V;
}

export interface Listener<V = unknown> {
  (event: Event<V>): boolean | void;
}

export interface ObserverInstance<T> {
  listen(listener: Listener<T>): VoidFunction;
  emit(event: Event<T>): void;
}

export interface ObserverWithTypeInstance<T, E> {
  listen(type: E, callback: Listener<T>): VoidFunction;
  listen(type: E[], callback: Listener<T>): VoidFunction;
  emit(type: E, event: Event<T>): void;
}

//#endregion

//#region Manager

export interface RequiredManagerInstance<T> {
  get value(): T;
  set(value: T): boolean;
  manager(key: string | symbol): ManagerInstance | null;
}

export type ObserverTypes =
  | "change"
  | "add"
  | "remove"
  | "define"
  | "dispose"
  | "all";

export interface ManagerInstance<T = any, M = any>
  extends ObserverWithTypeInstance<T, ObserverTypes>,
    RequiredManagerInstance<T> {
  path: string[];
  managers: M;
  get name(): string;
  get keys(): string[];
  get snapshot(): T;
  set(value: T): boolean;
  manager(key: string | symbol): ManagerInstance | null;
  dispose(): void;
  disposeManagers(): void;
  toString(): string;
}

//#endregion

//#region PathTree

export interface PathNodeInstance {
  value: string;
  manager: ManagerInstance | null;
  listenTypes: ObserverTypes[];
  children: Record<string, PathNodeInstance>;
  get keys(): string[];
  push(paths: string[]): void;
}

export type ListenManagersResult = {
  manager: ManagerInstance;
  listenTypes: ObserverTypes[];
};

export interface PathsTreeInstance {
  getListenManagers(): ListenManagersResult[];
}

//#endregion

//#region Reaction

export interface ReactionInstance {
  id: string;
  dispose(): void;
  startWatch(): void;
  endWatch(): void;
  getPathTree(): PathsTreeInstance | null;
  syncCaptured<T>(fn: () => T): T;
  watch(watch: WatchCallback): VoidFunction;
}

export interface WatchCallback {
  (unlisten: VoidFunction): void;
}

//#endregion
