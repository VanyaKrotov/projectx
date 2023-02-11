export type FieldType = "action" | "computed" | "property";

export type PropertiesInfo = Record<string, PropertyDescriptor>;

//#region Manager

export interface RequiredManagerInstance<T> {
  get value(): T;
  set(value: T): boolean;
  getTarget(): T;
}

export interface FreeManagerInstance<T> {
  path: any[];
  target: T;
  get name(): any;
  get keys(): any[];
  get snapshot(): T;
  dispose(): void;
  disposeManagers(): void;
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
    RequiredManagerInstance<T>,
    FreeManagerInstance<T> {
  values: M;
  set(value: T): boolean;
  manager(key: string | symbol): ManagerInstance | null;
  toString(): string;
}

export interface ManagerOptions {
  path?: any[];
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

//#region Interceptor

export interface InterceptorEvent {
  path: string[];
}

export interface InterceptorListener {
  (event: InterceptorEvent): void;
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
}

export type GetConstructorArgs<T> = T extends new (...args: infer U) => unknown
  ? U
  : never;

export interface Constructable<T, A> {
  new (...args: GetConstructorArgs<A>): T;
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
  getPathTree(): PathsTreeInstance | null;
  syncCaptured<T>(fn: () => T): T;
  watch(watch: WatchCallback): VoidFunction;
}

export interface WatchCallback {
  (unlisten: VoidFunction): void;
}

//#endregion

export interface Annotation {}

export interface ConfigAnnotation extends Annotation {
  observable?: boolean;
}

export interface ObserverAnnotation extends Annotation {}

export interface ComputedAnnotation extends Annotation {
  memoised?: boolean; // default true
}

export interface ValueAnnotation extends Annotation {}

export interface ArrayAnnotation extends Annotation {}

export interface EntryAnnotation {
  [k: string]: ConfigAnnotation;
}

export interface Annotated {
  get annotation(): EntryAnnotation;
}

//#region Annotation
