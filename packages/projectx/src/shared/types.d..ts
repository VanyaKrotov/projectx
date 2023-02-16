declare type PropertiesInfo = Record<string, PropertyDescriptor>;

//#region Manager

declare type Path = string | number | symbol | never;

declare interface ManagerInstance<T = any>
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

declare interface ValueManagerInstance<T> extends ManagerInstance<T> {}

declare interface ComputedManagerInstance<T> extends ManagerInstance<T> {}

declare interface ContainerManagerInstance<T = any, V = any>
  extends ManagerInstance<T> {
  values: V;
  get keys(): Path[];
  disposeManagers(): void;
  manager(key: Path): ManagerInstance | null;
}

declare interface ObjectManagerInstance<T, V>
  extends ContainerManagerInstance<T, V> {}

declare interface ArrayManagerInstance<T, V>
  extends ContainerManagerInstance<T, V> {}

declare interface MapManagerInstance<K, T>
  extends ContainerManagerInstance<Map<K, T>, Map<K, ManagerInstance<T>>> {}

declare interface SetManagerInstance<T>
  extends ContainerManagerInstance<Set<T>, Set<ManagerInstance<T>>> {}

declare type ActionTypes =
  | "change"
  | "expansion"
  | "compression"
  | "define"
  | "dispose"
  | "all"
  | "reinstall";

declare interface ManagerOptions {
  path?: Path[];
  annotation?: number;
}

declare interface ObjectManagerOptions extends ManagerOptions {
  annotations?: Record<string, number>;
}

//#endregion

//#region observer

declare interface Event<V = unknown> {
  current?: V;
  prev?: V;
}

declare interface Listener<V = unknown> {
  (event: Event<V>): boolean | void;
}

declare interface ObserverInstance<T> {
  listen(listener: Listener<T>): VoidFunction;
  emit(event: Event<T>): void;
}

declare interface ObserverWithTypeInstance<T, E> {
  listen(type: E, callback: Listener<T>): VoidFunction;
  listen(type: E[], callback: Listener<T>): VoidFunction;
  emit(type: E, event: Event<T>): void;
  shareListeners(): Map<E | "all", ObserverInstance<T>>;
  receiveListeners(listeners: Map<E | "all", ObserverInstance<T>>): void;
  dispose(): void;
}

//#endregion

//#region PathTree

declare interface PathNodeInstance {
  value: Path;
  manager: ManagerInstance | null;
  listenTypes: ActionTypes[];
  children: Map<Path, PathNodeInstance>;
  get keys(): Path[];
  push(paths: Path[]): void;
}

declare type ListenManagersResult = {
  manager: ManagerInstance;
  listenTypes: ActionTypes[];
};

declare interface PathsTreeInstance {
  getListenManagers(): ListenManagersResult[];
  push(path: Path[]): void;
  clear(): void;
  get isEmpty(): boolean;
}

//#endregion

//#region Interceptor

declare interface InterceptorEvent {
  path: Path[];
}

declare interface InterceptorListener {
  (event: InterceptorEvent): void | boolean;
}

declare interface InterceptorInstance {
  emit(event: InterceptorEvent): void;
  register(listener: InterceptorListener): void;
  unregister(listener: InterceptorListener): void;
}

//#endregion

//#region Batch

declare interface BatchInstance {
  open(): void;
  action(handler: VoidFunction): void;
  close(): void;
}

//#endregion

//#region Common

declare interface ConfigurationManagerInstance {
  get config(): Configuration;
  reset(): void;
  change(config: Partial<Configuration>): void;
}

declare interface Configuration {
  equalResolver: IsEqualFunction<never>;
  develop: boolean;
}

declare interface IsEqualFunction<T> {
  (a: T, b: T): boolean;
}
//#endregion

//#region reaction

declare interface WatchOptions<T> {
  isEqual: IsEqualFunction<T>;
  initialCall: boolean;
}

//#endregion

//#region Reaction

declare interface ReactionInstance {
  id: string;
  get isEmptyObservers(): boolean;
  dispose(): void;
  startCatchCalls(): void;
  endCatchCalls(): void;
  syncCaptured<T>(fn: () => T): T;
  setReactionCallback(callback: ReactionCallback): void;
}

declare interface ReactionCallback {
  (unlisten: VoidFunction): void;
}

//#endregion
