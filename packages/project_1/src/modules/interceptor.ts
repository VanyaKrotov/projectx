import {
  InterceptorEvent,
  InterceptorListener,
  InterceptorInstance,
} from "shared/types";

import PathTree from "modules/paths-tree";

class Interceptor implements InterceptorInstance {
  private readonly batches = new Set<InterceptorListener>();

  private watch<T>(fn: () => T, listener: InterceptorListener) {
    this.register(listener);

    const result = fn();

    this.unregister(listener);

    return result;
  }

  public register(listener: InterceptorListener): void {
    this.batches.add(listener);
  }

  public unregister(listener: InterceptorListener): void {
    this.batches.delete(listener);
  }

  public emit(event: InterceptorEvent): void {
    if (!this.batches.size) {
      return;
    }

    Array.from(this.batches).pop()!(event);
  }

  public getCaptured<T>(fn: () => T) {
    const paths: string[][] = [];

    const result = this.watch(fn, ({ path }) => {
      paths.push(path);
    });

    return {
      result,
      variables: new PathTree(paths),
    };
  }

  public optimizePaths(paths: string[][]): PathTree {
    return new PathTree(paths);
  }
}

const interceptor = new Interceptor();

export default interceptor;
