export interface PathTreeNodeInstance {
  path: string;
  children: Record<string, PathTreeNodeInstance>;
  get isEmpty(): boolean;
  point: boolean;
}

export interface ObserverEvent {
  changeTree: PathTreeNodeInstance;
}

export interface ObserverListener<T> {
  (event: ObserverEvent): void | boolean;
}

export interface ObserverInstance<T> {
  listen(listener: ObserverListener<T>): VoidFunction;
  dispose(): void;
}

export interface WatchOptions {
  initCall: boolean;
}

export interface ObserveStateInstance<S extends DataObject = DataObject>
  extends ObserverInstance<S> {
  data: S;
  reaction<T extends unknown[]>(
    selectors: ((state: S) => unknown)[],
    action: (...args: T) => void,
    options?: Partial<ReactionOptions>
  ): VoidFunction;
  watch(
    paths: string[],
    action: VoidFunction,
    options?: Partial<WatchOptions>
  ): VoidFunction;
  watch(
    paths: PathTreeInstance,
    action: VoidFunction,
    options?: Partial<WatchOptions>
  ): VoidFunction;
  dispose(): void;
}

export interface CommitChange {
  path: string;
  value: unknown;
}

export interface StateInstance<S extends DataObject = DataObject>
  extends ObserveStateInstance<S> {
  change(value: Partial<S>): void;
  commit(changes: CommitChange[]): boolean[];
}

export interface EqualResolver<T> {
  (a: T, b: T): boolean;
}

export interface ReactionOptions {
  resolver: EqualResolver<unknown>;
  initCall: boolean;
}

export type CombineState<T extends Record<string, ObserveStateInstance>> = {
  [P in keyof T]: T[P]["data"];
};

export type DataObject = { [key: string | symbol | never]: unknown | any };

export interface PathTreeInstance extends PathTreeNodeInstance {
  push(path: string): void;
  includes(tree: PathTreeNodeInstance): boolean;
}
