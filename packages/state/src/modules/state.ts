import type {
  ObserveStateInstance,
  ReactionOptions,
  DataObject,
  StateInstance,
  CommitChange,
  PathTreeInstance,
  WatchOptions,
} from "../shared/types";

import { Observer, Path, PathTree } from "../components";
import { defaultEqualResolver } from "../shared";
import { manager } from "./batch";

abstract class ObserveState<S extends DataObject = DataObject>
  extends Observer<S>
  implements ObserveStateInstance<S>
{
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

  public watch(
    paths: string[],
    action: VoidFunction,
    options?: Partial<WatchOptions>
  ): VoidFunction;
  public watch(
    paths: PathTreeInstance,
    action: VoidFunction,
    options?: Partial<WatchOptions>
  ): VoidFunction;
  public watch(
    paths: unknown,
    action: VoidFunction,
    { initCall = false }: Partial<WatchOptions> = {}
  ): VoidFunction {
    let tree = paths as PathTreeInstance;
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
    });
  }
}

abstract class State<S extends DataObject = DataObject>
  extends ObserveState<S>
  implements StateInstance<S>
{
  public abstract readonly data: S;

  public change(value: Partial<S>): void {
    const changeTree = new PathTree();
    for (const key in value) {
      changeTree.push(key);

      this.data[key] = (value as S)[key];
    }

    this.emit({
      changeTree,
    });
  }

  public commit(changes: CommitChange[]): boolean[] {
    const changeTree = new PathTree();
    const results: boolean[] = [];
    for (const { path, value } of changes) {
      changeTree.push(path);

      results.push(Path.set(this.data, path, value));
    }

    this.emit({ changeTree });

    return results;
  }
}

export { ObserveState, State };
