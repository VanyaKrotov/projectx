import type {
  ComputedAnnotation,
  ManagerInstance,
  ManagerOptions,
  ReactionInstance,
  RequiredManagerInstance,
} from "../../shared/types";
import { runAfterScript } from "../../shared/utils";
import { ANNOTATIONS } from "../../shared/constants";

import { Reaction } from "../reaction";
import Manager from "./manager";

class ComputedManager<T>
  extends Manager<T, ComputedAnnotation, null>
  implements RequiredManagerInstance<T>
{
  private reaction: ReactionInstance;
  private memo?: T;
  private memoized = false;
  private isChanged = false;
  public managers = null;

  constructor(public readonly target: T, options: ManagerOptions) {
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

      if (this.memoized && !this.isChanged) {
        return this.memo!;
      }

      this.memo = this.reaction.syncCaptured(this.target as () => T);
      this.memoized = true;
      this.isChanged = false;

      this.reaction.watch(() => {
        this.isChanged = true;

        runAfterScript(() => {
          this.emit("change", {
            current: undefined as T,
            prev: this.memo!,
          });
        });
      });

      return this.memo;
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
