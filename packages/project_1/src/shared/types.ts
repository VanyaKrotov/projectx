//#region Manager

export interface RootManagerInstance {
  addManager(manager: ManagerInstance): void;
  getManager(name: string): ManagerInstance | null;
  getManagerByPath(path: string[]): ManagerInstance | null;
  addReaction(id: string, reaction: ReactionInstance): void;
  getReaction(id: string): ReactionInstance | null;
  deleteReaction(id: string): boolean;
}

export interface RequiredManagerInstance<T> {
  get value(): T;
  setValue(value: T): boolean;
  getManager(key: string | symbol): ManagerInstance | null;
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
  setValue(value: T): boolean;
  getManager(key: string | symbol): ManagerInstance | null;
  dispose(): void;
  toString(): string;
}

export interface ManagerOptions {
  path: string[];
  annotation?: Annotation;
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
}

//#endregion

//#region OptimizationTree

export interface TreeNodeInstance {
  value: string;
  manager: ManagerInstance | null;
  listenTypes: ObserverTypes[];
  children: Record<string, TreeNodeInstance>;
  get keys(): string[];
  pushPath(paths: string[]): void;
}

export type ListenManagersResult = {
  manager: ManagerInstance;
  listenTypes: ObserverTypes[];
};

export interface OptimizationTreeInstance {
  getListenManagers(): ListenManagersResult[];
}

//#endregion

//#region Interceptor

export interface InterceptorEvent {
  path: string[];
}

export interface InterceptorListener {
  (event: InterceptorEvent): void;
}

export interface InterceptorInstance {
  emit(event: InterceptorEvent): void;
  getCaptured<T>(fn: () => T): {
    result: T;
    variables: OptimizationTreeInstance;
  };
  register(listener: InterceptorListener): void;
  unregister(listener: InterceptorListener): void;
  optimizePaths(paths: string[][]): OptimizationTreeInstance;
}

//#endregion

//#region Batch

export interface BatchInstance {
  get hasBatch(): boolean;
  open(): void;
  action(handler: VoidFunction): void;
  closeBatch(): void;
}

//#endregion

//#region Common

export interface Constructable<T extends object> {
  new (...args: any[]): T;
  prototype: T;
  name: string;
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
  dispose(): void;
  startWatch(): void;
  endWatch(): void;
  getOptimizationTree(): OptimizationTreeInstance | null;
  syncCaptured<T>(fn: () => T): T;
  watch(watch: WatchCallback): VoidFunction;
}

export interface WatchCallback {
  (unlisten: VoidFunction): void;
}

//#endregion

export interface Annotation {
  observable?: boolean;
}

export interface ObserverAnnotation extends Annotation {}

export interface ComputedAnnotation extends Annotation {
  memoised?: boolean; // default true
}

export interface ValueAnnotation extends Annotation {}

export interface ArrayAnnotation extends Annotation {}

export interface EntryAnnotation {
  fields: Record<string, ObserverAnnotation>;
  getters: Record<string, ComputedAnnotation>;
}

export interface Annotated {
  get annotation(): Partial<EntryAnnotation>;
}

//#region Annotation
