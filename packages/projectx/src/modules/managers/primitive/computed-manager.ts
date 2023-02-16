import { AnnotationTypes } from "../../../shared";
import { Reaction } from "../../reaction";

import { BasicManager } from "../abstraction";

class ComputedManager<T extends () => T>
  extends BasicManager<T>
  implements ComputedManagerInstance<T>
{
  private reaction: ReactionInstance;
  private memo?: T;
  private memoized = false;
  private isChanged = false;

  constructor(target: T, options: ManagerOptions) {
    super(target, options);

    this.reaction = new Reaction("computed");

    this.reaction.setReactionCallback(() => {
      this.isChanged = true;

      this.emit("change", {
        prev: this.memo!,
      });
    });
  }

  public get snapshot(): T {
    return this.target();
  }

  private targetHandler = (): T => {
    this.reportUsage();

    if (this.memoized && !this.isChanged) {
      return this.memo!;
    }

    this.memo = this.reaction.syncCaptured(this.target);
    this.memoized = true;
    this.isChanged = false;

    return this.memo;
  };

  public set(): boolean {
    return false;
  }

  public dispose(): void {
    this.reaction.dispose();
    super.dispose();
  }

  public get(): T {
    return this.targetHandler();
  }

  public support(value: T): boolean {
    return typeof value === "function";
  }
}

export default ComputedManager;
