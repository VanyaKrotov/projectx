import set from "lodash/set";

import { Observer } from "../components/observer";
import { PathTree } from "../components/path-tree";

import { manager } from "./batch";

interface EqualResolver<T> {
  (a: T, b: T): boolean;
}

interface OnOptions {
  initCall: boolean;
  priority: number;
}

interface ReactionOptions {
  resolver: EqualResolver<unknown>;
  initCall: boolean;
}

interface CommitChange {
  path: string;
  value: unknown;
}

type DataObject = { [key: string | symbol | never]: unknown | any };

const defaultEqualResolver: EqualResolver<unknown> = (a, b) => a === b;

abstract class ObserveState<
  S extends DataObject = DataObject,
  D extends object = object
> extends Observer<D> {
  public abstract readonly data: S;

  public reaction<T extends unknown[]>(
    selectors: ((state: S) => unknown)[],
    action: (...args: T) => void,
    {
      resolver = defaultEqualResolver,
      initCall = false,
    }: Partial<ReactionOptions> = {}
  ): VoidFunction {
    const callSelectors = () =>
      selectors.map((selector) => selector(this.data)) as T;
    const hasSelector = selectors.length > 0;
    let memo = callSelectors();
    if (initCall) {
      action.apply(null, memo);
    }

    const handler = () => {
      if (!hasSelector) {
        return action.apply(null);
      }

      const values = callSelectors();
      if (values.every((value, index) => resolver(value, memo[index]))) {
        return;
      }

      memo = values;

      return action.apply(null, memo);
    };

    return this.listen(() => manager.action(handler));
  }

  public on(
    paths: string[],
    action: VoidFunction,
    options?: Partial<OnOptions>
  ): VoidFunction;
  public on(
    paths: PathTree,
    action: VoidFunction,
    options?: Partial<OnOptions>
  ): VoidFunction;
  public on(
    paths: unknown,
    action: VoidFunction,
    { initCall = false, priority }: Partial<OnOptions> = {}
  ): VoidFunction {
    let tree = paths as PathTree;
    if (!(paths instanceof PathTree)) {
      tree = new PathTree(paths as string[]);
    }

    if (initCall) {
      action();
    }

    return this.listen(({ changeTree }) => {
      if (!tree.includes(changeTree)) {
        return;
      }

      return manager.action(action);
    }, priority);
  }

  public once(
    paths: string[],
    action: VoidFunction,
    priority?: number
  ): VoidFunction;
  public once(
    paths: PathTree,
    action: VoidFunction,
    priority?: number
  ): VoidFunction;
  public once(
    paths: any,
    action: VoidFunction,
    priority?: number
  ): VoidFunction {
    const unsubscribe = this.on(
      paths,
      () => {
        action();
        unsubscribe();
      },
      { priority }
    );

    return unsubscribe;
  }

  public when(
    paths: string[],
    action: (data: S) => boolean,
    priority?: number
  ): Promise<S>;
  public when(
    paths: PathTree,
    action: (data: S) => boolean,
    priority?: number
  ): Promise<S>;
  public when(
    paths: any,
    action: (data: S) => boolean,
    priority?: number
  ): Promise<S> {
    return new Promise((resolve) => {
      const unsubscribe = this.on(
        paths,
        () => {
          if (!action(this.data)) {
            return;
          }

          resolve(structuredClone(this.data));
          unsubscribe();
        },
        { priority }
      );
    });
  }
}

abstract class State<
  S extends DataObject = DataObject
> extends ObserveState<S> {
  public abstract readonly data: S;

  public change(value: Partial<S>): void {
    const changeTree = new PathTree();
    for (const key in value) {
      changeTree.push(key);

      this.data[key] = (value as S)[key];
    }

    this.emit({
      changeTree,
      detail: {},
    });
  }

  public commit(changes: CommitChange[]): boolean[] {
    const changeTree = new PathTree();
    const results: boolean[] = [];
    for (const { path, value } of changes) {
      changeTree.push(path);

      results.push(Boolean(set(this.data, path, value)));
    }

    this.emit({ changeTree, detail: {} });

    return results;
  }
}

export { ObserveState, State };
