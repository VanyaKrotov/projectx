import {
  ListenManagersResult,
  ManagerInstance,
  ObserverTypes,
  PathNodeInstance,
  PathsTreeInstance,
} from "shared/types";
import { isEqualArray } from "shared/utils";

import rootManager from "./root-manager";

class TreeNode implements PathNodeInstance {
  public children: Record<string, PathNodeInstance> = {};
  public listenTypes: ObserverTypes[] = [];

  constructor(public value: string, public manager: ManagerInstance) {}

  public get keys() {
    return Object.keys(this.children);
  }

  public push([path, ...paths]: string[]): void {
    const nextNode =
      this.children[path] ||
      new TreeNode(path, this.manager!.getManager(path)!);

    this.children[path] = nextNode;

    if (!paths.length) {
      return;
    }

    return nextNode.push(paths);
  }
}

class PathTree implements PathsTreeInstance {
  private nodes: Record<string, PathNodeInstance> = {};

  constructor(paths: string[][]) {
    for (const [path, ...restPath] of paths) {
      this.nodes[path] =
        this.nodes[path] || new TreeNode(path, rootManager.getManager(path));

      this.nodes[path].push(restPath);
    }

    for (const key in this.nodes) {
      this.linkingRecursive(this.nodes[key]);
    }
  }

  private linkingRecursive(node: PathNodeInstance) {
    const keys = Object.keys(node.children);
    if (!keys.length) {
      return (node.listenTypes = ["all"]);
    }

    node.listenTypes = isEqualArray(keys, node.manager!.keys)
      ? ["add", "change", "remove"]
      : ["change"];

    for (const key of keys) {
      this.linkingRecursive(node.children[key]);
    }
  }

  private optimizedManagersRec(node: PathNodeInstance): ListenManagersResult[] {
    let res: ListenManagersResult[] = [
      { listenTypes: node.listenTypes, manager: node.manager! },
    ];
    if (!node.keys.length) {
      return res;
    }

    for (const key in node.children) {
      res = res.concat(this.optimizedManagersRec(node.children[key]));
    }

    return res;
  }

  public getListenManagers(): ListenManagersResult[] {
    let result: ListenManagersResult[] = [];
    for (const key in this.nodes) {
      result = result.concat(this.optimizedManagersRec(this.nodes[key]));
    }

    return result;
  }
}

export default PathTree;
