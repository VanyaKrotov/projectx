import type {
  ComputedAnnotation,
  ManagerInstance,
  ManagerOptions,
  ReactionInstance,
  RequiredManagerInstance,
} from "shared/types";
import { runAfterScript } from "shared/utils";
import { ANNOTATIONS } from "shared/constants";

import { Reaction } from "../reaction";
import Manager from "./manager";

class ComputedManager<T>
  extends Manager<T, ComputedAnnotation, null>
  implements RequiredManagerInstance<T>
{
  private reaction: ReactionInstance;
  private savedResult?: T;
  private isMemoized = false;
  private isChanged = false;
  public managers = null;

  constructor(private readonly target: T, options: ManagerOptions) {
    super(options, ANNOTATIONS.computed);

    this.reaction = new Reaction(`Computed#${this.path.join(".")}`);

    this.emit("define", { current: this.snapshot });
  }

  public manager(): ManagerInstance | null {
    return null;
  }

  public get snapshot(): T {
    return (this.target as Function)();
  }

  public get value(): T {
    const { memoised } = this.annotation;
    if (!memoised) {
      return this.target;
    }

    return (() => {
      this.reportUsage();

      if (this.isMemoized && !this.isChanged) {
        return this.savedResult!;
      }

      this.savedResult = this.reaction.syncCaptured(this.target as () => T);
      this.isMemoized = true;
      this.isChanged = false;

      this.reaction.watch(() => {
        this.isChanged = true;

        runAfterScript(() => {
          this.emit("change", {
            current: undefined as T,
            prev: this.savedResult!,
          });
        });
      });

      return this.savedResult;
    }) as T;
  }

  public set(): boolean {
    return false;
  }

  public dispose(): void {
    this.reaction.dispose();
    super.dispose();
  }
}

export default ComputedManager;
