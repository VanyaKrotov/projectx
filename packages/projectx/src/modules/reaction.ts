import type {
  InterceptorEvent,
  ReactionInstance,
  WatchCallback,
} from "../shared";
import { uid } from "../shared/uid";

import PathTree from "./paths-tree";
import { batch, interceptor, reactions } from "../components";

class Reaction implements ReactionInstance {
  private unsubscribeFns: (() => void)[] = [];
  private tree = new PathTree();

  public readonly id: string;

  constructor(id: string = "Reaction") {
    this.id = `${id}#${uid()}`;

    reactions.set(this.id, this);
  }

  private listener = ({ path }: InterceptorEvent) => {
    this.tree.push(path);
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
