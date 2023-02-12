import type {
  ContainerManagerInstance,
  InterceptorEvent,
  Path,
  ReactionInstance,
  WatchCallback,
} from "../shared";
import { uid } from "../shared/uid";

import PathTree from "./paths-tree";
import { batch, interceptor, managers, reactions } from "../components";

class Reaction implements ReactionInstance {
  private unsubscribeFns: (() => void)[] = [];

  public readonly id: string;
  private tree: PathTree;

  constructor(
    id: string = "Reaction",
    private scope: Map<Path, ContainerManagerInstance> = managers
  ) {
    this.id = `${id}#${uid()}`;

    this.tree = new PathTree(scope);

    reactions.set(this.id, this);
  }

  private listener = ({ path }: InterceptorEvent) => {
    const has = this.scope?.has(path[0]);
    if (has) {
      this.tree.push(path);
    }

    return !has;
  };

  private unlisten = () => {
    if (!this.unsubscribeFns.length) {
      return;
    }

    this.unsubscribeFns.forEach((unlistener) => unlistener());
    this.unsubscribeFns = [];
  };

  public dispose(): void {
    reactions.delete(this.id);

    this.tree.clear();
    this.unlisten();
  }

  public startWatch(): void {
    this.tree.clear();
    interceptor.register(this.listener);
  }

  public endWatch(): void {
    interceptor.unregister(this.listener);
  }

  public watch(watch: WatchCallback): VoidFunction {
    if (this.tree.isEmpty) {
      console.warn(
        `Instances for listen in reaction \`${this.id}\` not found. Reconsider the use of adverse reactions.`
      );

      return () => {};
    }

    const managers = this.tree.getListenManagers();
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
