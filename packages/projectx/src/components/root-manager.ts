import { ManagerInstance, RootManagerInstance } from "shared/types";

class RootManager implements RootManagerInstance {
  private readonly managers: Record<string, ManagerInstance> = {};

  public add(manager: ManagerInstance): void {
    this.managers[manager.name] = manager;
  }

  public get(id: string): ManagerInstance {
    return this.managers[id];
  }

  private getByPathRec(
    root: ManagerInstance,
    [path, ...rest]: string[]
  ): ManagerInstance | null {
    if (root.name === path) {
      return root;
    }

    if (!rest.length) {
      return root.managers[path];
    }

    return this.getByPathRec(root.managers[path], rest);
  }

  public getByPath([rootPath, ...restPath]: string[]): ManagerInstance | null {
    return this.getByPathRec(this.managers[rootPath], restPath);
  }
}

export default RootManager;
