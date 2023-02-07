import {
  ManagerInstance,
  ReactionInstance,
  RootManagerInstance,
} from "shared/types";

class RootManager implements RootManagerInstance {
  private readonly managers: Record<string, ManagerInstance> = {};
  private readonly reactions: Record<string, ReactionInstance> = {};

  public addReaction<T>(id: string, reaction: ReactionInstance): void {
    this.reactions[id] = reaction;
  }

  public deleteReaction(id: string): boolean {
    return delete this.reactions[id];
  }

  public getReaction<T>(id: string): ReactionInstance {
    return this.reactions[id];
  }

  public addManager(manager: ManagerInstance): void {
    this.managers[manager.name] = manager;
  }

  public getManager(id: string): ManagerInstance {
    return this.managers[id];
  }

  private getManagerByPathRecursive(
    root: ManagerInstance,
    [path, ...rest]: string[]
  ): ManagerInstance | null {
    if (root.name === path) {
      return root;
    }

    if (!rest.length) {
      return root.managers[path];
    }

    return this.getManagerByPathRecursive(root.managers[path], rest);
  }

  public getManagerByPath([
    rootPath,
    ...restPath
  ]: string[]): ManagerInstance<any> | null {
    return this.getManagerByPathRecursive(this.managers[rootPath], restPath);
  }
}

export default new RootManager();
