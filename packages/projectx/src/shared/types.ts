export type PropertiesInfo = Record<string, PropertyDescriptor>;

//#region Manager

export type Path = string | number | symbol | never;

export interface ManagerInstance<T = any>
  extends ObserverWithTypeInstance<T, ActionTypes> {
  path: Path[];
  target: T;
  annotation: number;
  get name(): Path;
  get snapshot(): T;
  get(): T;
  set(value: T): boolean;
  source(): T;
  dispose(): void;
  support(value: T): boolean;
}

export interface ValueManagerInstance<T> extends ManagerInstance<T> {}

export interface ComputedManagerInstance<T> extends ManagerInstance<T> {}

export interface ContainerManagerInstance<T = any, V = any>
  extends ManagerInstance<T> {
  values: V;
  get keys(): Path[];
  disposeManagers(): void;
  manager(key: Path): ManagerInstance | null;
}

export interface ObjectManagerInstance<T, V>
  extends ContainerManagerInstance<T, V> {}

export interface ArrayManagerInstance<T, V>
  extends ContainerManagerInstance<T, V> {}

export interface MapManagerInstance<K, T>
  extends ContainerManagerInstance<Map<K, T>, Map<K, ManagerInstance<T>>> {}

export interface SetManagerInstance<T>
  extends ContainerManagerInstance<Set<T>, Set<ManagerInstance<T>>> {}

export type ActionTypes =
  | "change"
  | "expansion"
  | "compression"
  | "define"
  | "dispose"
  | "all"
  | "reinstall";

export interface ManagerOptions {
  path?: Path[];
  annotation?: number;
}

export interface ObjectManagerOptions extends ManagerOptions {
  annotations?: Record<string, number>;
}

//#endregion

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
  shareListeners(): Map<E | "all", ObserverInstance<T>>;
  receiveListeners(listeners: Map<E | "all", ObserverInstance<T>>): void;
  dispose(): void;
}

//#endregion

//#region PathTree

export interface PathNodeInstance {
  value: Path;
  manager: ManagerInstance | null;
  listenTypes: ActionTypes[];
  children: Map<Path, PathNodeInstance>;
  get keys(): Path[];
  push(paths: Path[]): void;
}

export type ListenManagersResult = {
  manager: ManagerInstance;
  listenTypes: ActionTypes[];
};

export interface PathsTreeInstance {
  getListenManagers(): ListenManagersResult[];
  push(path: Path[]): void;
  clear(): void;
  get isEmpty(): boolean;
}

//#endregion

//#region Interceptor

export interface InterceptorEvent {
  path: Path[];
}

export interface InterceptorListener {
  (event: InterceptorEvent): void | boolean;
}

export interface InterceptorInstance {
  emit(event: InterceptorEvent): void;
  register(listener: InterceptorListener): void;
  unregister(listener: InterceptorListener): void;
}

//#endregion

//#region Batch

export interface BatchInstance {
  open(): void;
  action(handler: VoidFunction): void;
  close(): void;
}

//#endregion

//#region Common

export interface ConfigurationManagerInstance {
  get config(): Configuration;
  reset(): void;
  change(config: Partial<Configuration>): void;
}

export interface Configuration {
  equalResolver: IsEqualFunction<never>;
  develop: boolean;
}

export interface IsEqualFunction<T> {
  (a: T, b: T): boolean;
}
//#endregion

//#region reaction

export interface WatchOptions<T> {
  isEqual: IsEqualFunction<T>;
  initialCall: boolean;
}

//#endregion

//#region Reaction

export interface ReactionInstance {
  id: string;
  get isEmptyObservers(): boolean;
  dispose(): void;
  startCatchCalls(): void;
  endCatchCalls(): void;
  syncCaptured<T>(fn: () => T): T;
  setReactionCallback(callback: ReactionCallback): void;
}

export interface ReactionCallback {
  (unlisten: VoidFunction): void;
}

//#endregion
