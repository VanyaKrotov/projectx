import type {
  ComputedManagerInstance,
  ManagerOptions,
  ReactionInstance,
} from "../../shared";
import { ANNOTATIONS } from "../../shared";

import { Reaction } from "../reaction";

import BasicManager from "./basic-manager";

class ComputedManager<T extends () => T>
  extends BasicManager<T>
  implements ComputedManagerInstance<T>
{
  public annotation = ANNOTATIONS.computed;
  private reaction: ReactionInstance;
  private memo?: T;
  private memoized = false;
  private isChanged = false;

  constructor(target: T, options: ManagerOptions) {
    super(target, options);

    this.annotation = { ...this.annotation, ...options.annotation };
    this.reaction = new Reaction(`Computed#${this.path.join(".")}`);
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

    this.reaction.watch(() => {
      this.isChanged = true;

      this.emit("change", {
        prev: this.memo!,
      });
    });

    return this.memo;
  };

  public dispose(): void {
    this.reaction.dispose();
    super.dispose();
  }

  public get(): T {
    if (!this.annotation.memoised) {
      return this.snapshot;
    }

    return this.targetHandler();
  }
}

export default ComputedManager;
