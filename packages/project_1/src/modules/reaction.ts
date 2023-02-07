import { nanoid } from "nanoid";

import {
  InterceptorEvent,
  OptimizationTreeInstance,
  ReactionInstance,
  WatchCallback,
} from "shared/types";

import batch from "./batch";
import interceptor from "./interceptor";
import OptimizationTree from "./optimization-tree";
import rootManager from "./root-manager";

class Reaction implements ReactionInstance {
  private paths: string[][] = [];
  private unsubscribeFns: (() => void)[] = [];

  constructor(public readonly id: string = `Reaction#${nanoid(4)}`) {
    rootManager.addReaction(id, this);
  }

  private listener = ({ path }: InterceptorEvent) => {
    this.paths.push(path);
  };

  private unlisten = () => {
    if (!this.unsubscribeFns.length) {
      return;
    }

    this.unsubscribeFns.forEach((unlistener) => unlistener());
    this.unsubscribeFns = [];
  };

  public getOptimizationTree(): OptimizationTreeInstance | null {
    if (!this.paths.length) {
      return null;
    }

    return new OptimizationTree(this.paths);
  }

  public dispose(): void {
    rootManager.deleteReaction(this.id);

    this.paths = [];
    this.unlisten();
  }

  public startWatch(): void {
    this.paths = [];
    interceptor.register(this.listener);
  }

  public endWatch(): void {
    interceptor.unregister(this.listener);
  }

  public watch(watch: WatchCallback): VoidFunction {
    const tree = this.getOptimizationTree();
    if (!tree) {
      console.warn(
        `Instances for listen in reaction \`${this.id}\` not found. Reconsider the use of adverse reactions.`
      );

      return () => {};
    }

    const managers = tree.getListenManagers();
    const handler = () => watch(this.unlisten);
    this.unlisten();
    this.unsubscribeFns = managers.map(({ listenTypes, manager }) =>
      manager.listen(listenTypes, () => {
        batch.action(handler);
      })
    );

    return this.unlisten;
  }

  public syncCaptured<T>(fn: () => T): T {
    this.startWatch();

    const result = fn();

    this.endWatch();

    return result;
  }
}

export { Reaction };
