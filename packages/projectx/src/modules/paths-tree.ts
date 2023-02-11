import {
  getManagerOf,
  ListenManagersResult,
  ManagerInstance,
  Path,
  ActionTypes,
  PathNodeInstance,
  PathsTreeInstance,
  getKeysOfManager,
} from "../shared";
import { isEqualArray } from "../shared";

import { managers } from "../components";

class PathNode implements PathNodeInstance {
  public children = new Map<Path, PathNodeInstance>();
  public listenTypes: ActionTypes[] = [];

  constructor(public value: Path, public manager: ManagerInstance | null) {}

  public get keys() {
    return Array.from(this.children.keys());
  }

  public push([path, ...paths]: Path[]): void {
    const nextNode =
      this.children.get(path) ||
      new PathNode(path, getManagerOf(this.manager, path));

    this.children.set(path, nextNode);

    if (!paths.length) {
      return;
    }

    return nextNode.push(paths);
  }
}

class PathTree implements PathsTreeInstance {
  private nodes = new Map<Path, PathNodeInstance>();

  public static fromPaths(paths: Path[][]): PathTree {
    const tree = new PathTree();
    for (const [path, ...restPath] of paths) {
      const node =
        tree.nodes.get(path) || new PathNode(path, managers.get(path) || null);

      node.push(restPath);

      tree.nodes.set(path, node);
    }

    return tree;
  }

  public push([path, ...restPath]: Path[]): void {
    let node = this.nodes.get(path);
    if (!node) {
      node = new PathNode(path, managers.get(path) || null);

      this.nodes.set(path, node);
    }

    if (restPath.length) {
      node.push(restPath);
    }
  }

  private linking(node: PathNodeInstance): ListenManagersResult[] {
    const keys = node.keys;
    if (!keys.length) {
      return [{ listenTypes: ["all"], manager: node.manager! }];
    }

    const isEqualKeys = isEqualArray(keys, getKeysOfManager(node.manager));
    const listenTypes = ["change"].concat(
      isEqualKeys ? ["expansion", "compression"] : []
    ) as ActionTypes[];
    let result: ListenManagersResult[] = [
      { listenTypes, manager: node.manager! },
    ];

    for (const [, children] of node.children) {
      result = result.concat(this.linking(children));
    }

    return result;
  }

  public getListenManagers(): ListenManagersResult[] {
    let result: ListenManagersResult[] = [];
    for (const [, node] of this.nodes) {
      result = result.concat(this.linking(node));
    }

    return result;
  }

  public clear(): void {
    this.nodes.clear();
  }

  public get isEmpty(): boolean {
    return !this.nodes.size;
  }
}

export default PathTree;
