import { Reaction } from "../../reaction";

import { BasicManager } from "../abstraction";

interface Computed<T> {
  (): T;
}

class ComputedManager<T>
  extends BasicManager<T>
  implements ComputedManagerInstance<T>
{
  private reaction: ReactionInstance;
  private memoValue?: T;
  private memoized = false;
  private changed = false;

  constructor(target: T, options: ManagerOptions) {
    super(target, options);

    this.reaction = new Reaction("computed");
    this.reaction.setReactionCallback(() => {
      this.changed = true;

      this.emit("change", {
        prev: this.memoValue,
      });
    });
  }

  public get snapshot(): T {
    return (this.target as Computed<T>)();
  }

  private targetHandler = (): T => {
    this.reportUsage();

    if (this.memoized && !this.changed) {
      return this.memoValue!;
    }

    this.memoValue = this.reaction.syncCaptured<T>(this.target as Computed<T>);
    this.memoized = true;
    this.changed = false;

    return this.memoValue;
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
