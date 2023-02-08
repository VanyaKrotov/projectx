import { ReactionInstance, ReactionManagerInstance } from "shared/types";

class ReactionManager implements ReactionManagerInstance {
  private readonly reactions: Record<string, ReactionInstance> = {};

  public add(id: string, reaction: ReactionInstance): void {
    this.reactions[id] = reaction;
  }

  public delete(id: string): boolean {
    return delete this.reactions[id];
  }

  public get(id: string): ReactionInstance | null {
    return this.reactions[id];
  }
}

export default ReactionManager;
