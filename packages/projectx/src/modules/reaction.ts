import type {
  ContainerManagerInstance,
  InterceptorEvent,
  Path,
  ReactionInstance,
  ReactionCallback,
} from "../shared";
import { uid } from "../shared/uid";

import PathTree from "./paths-tree";
import { batch, interceptor, managers, reactions } from "../components";

class Reaction implements ReactionInstance {
  private unsubscribeFns: (() => void)[] = [];
  private tree: PathTree;
  private reactionCallback: ReactionCallback | null = null;

  public readonly id: string;

  public get isEmptyObservers(): boolean {
    return this.tree.isEmpty;
  }

  constructor(
    id: string = "Reaction",
    private scope: Map<Path, ContainerManagerInstance> = managers
  ) {
    this.id = `${id}#${uid()}`;
    this.tree = new PathTree(scope);

    reactions.set(this.id, this);
  }

  private changeHandler = () => this.reactionCallback?.(this.unlisten);

  private listener = ({ path }: InterceptorEvent) => {
    const has = this.scope?.has(path[0]);
    if (!has) {
      return true;
    }

    this.tree.push(path);

    const managers = this.tree.getListenManagers();
    this.unlisten();
    this.unsubscribeFns = managers.map(({ listenTypes, manager }) =>
      manager.listen(listenTypes, () => {
        batch.action(this.changeHandler);
      })
    );
  };

  private unlisten = () => {
    this.unsubscribeFns.forEach((unlistener) => unlistener());
    this.unsubscribeFns = [];
  };

  public setReactionCallback(callback: ReactionCallback): void {
    this.reactionCallback = callback;
  }

  public dispose(): void {
    reactions.delete(this.id);

    this.tree.clear();
    this.unlisten();
  }

  public startCatchCalls(): void {
    this.tree.clear();
    interceptor.register(this.listener);
  }

  public endCatchCalls(): void {
    interceptor.unregister(this.listener);
  }

  public syncCaptured<T>(fn: () => T): T {
    this.startCatchCalls();

    const result = fn();

    this.endCatchCalls();

    return result;
  }
}

export { Reaction };
