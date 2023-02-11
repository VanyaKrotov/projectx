export type PropertiesInfo = Record<string, PropertyDescriptor>;

//#region Manager

export type ManagerPath = string | number | symbol | never;

export interface ManagerInstance<T = any> {
  path: ManagerPath[];
  target: T;
  get name(): ManagerPath;
  get snapshot(): T;
  get(): T;
  set(value: T): boolean;
  source(): T;
  dispose(): void;
  toString(): string;
}

export interface ValueManagerInstance<T> extends ManagerInstance<T> {}

export interface ComputedManagerInstance<T>
  extends ManagerInstance<T>,
    AnnotatedManagerInstance<ComputedAnnotation> {}

export interface AnnotatedManagerInstance<A> {
  annotation: A;
}

export interface ContainerManagerInstance<T, V> extends ManagerInstance<T> {
  values: V;
  get keys(): ManagerPath[];
  disposeManagers(): void;
  manager(key: string): ManagerInstance | null;
}

export interface ObjectManagerInstance<T, A, V>
  extends ContainerManagerInstance<T, V>,
    AnnotatedManagerInstance<A> {}

export interface ArrayManagerInstance<T, V>
  extends ContainerManagerInstance<T, V> {}

export type ObserverTypes =
  | "change"
  | "expansion"
  | "compression"
  | "define"
  | "dispose"
  | "all";

export interface ManagerOptions<A extends Annotation = Annotation> {
  path?: ManagerPath[];
  annotation?: A;
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
  path: ManagerPath[];
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
