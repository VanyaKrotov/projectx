import {
  ListenManagersResult,
  ManagerInstance,
  ObserverTypes,
  OptimizationTreeInstance,
  TreeNodeInstance,
} from "shared/types";
import { isEqualArray } from "shared/utils";

import rootManager from "./root-manager";

class TreeNode implements TreeNodeInstance {
  public children: Record<string, TreeNodeInstance> = {};
  public listenTypes: ObserverTypes[] = [];

  constructor(public value: string, public manager: ManagerInstance | null) {}

  public get keys() {
    return Object.keys(this.children);
  }

  public pushPath([path, ...paths]: string[]): void {
    const nextNode =
      this.children[path] ||
      new TreeNode(path, this.manager?.getManager(path) || null);

    this.children[path] = nextNode;

    if (!paths.length) {
      return;
    }

    return nextNode.pushPath(paths);
  }
}

class OptimizationTree extends TreeNode implements OptimizationTreeInstance {
  constructor(paths: string[][]) {
    super("", null);

    this.children = OptimizationTree.createNodesFromPaths(paths);

    this.linking();
  }

  private static createNodesFromPaths(
    paths: string[][]
  ): Record<string, TreeNodeInstance> {
    const nodes: Record<string, TreeNodeInstance> = {};
    for (const full of paths) {
      const [path, ...rest] = full;
      nodes[path] =
        nodes[path] || new TreeNode(path, rootManager.getManager(path));

      nodes[path].pushPath(rest);
    }

    return nodes;
  }

  private linkingRecursive(node: TreeNodeInstance) {
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

  private linking(): void {
    for (const key in this.children) {
      this.linkingRecursive(this.children[key]);
    }
  }

  private optimizedManagersRec(node: TreeNode): ListenManagersResult[] {
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
    for (const key in this.children) {
      result = result.concat(this.optimizedManagersRec(this.children[key]));
    }

    return result;
  }
}

export default OptimizationTree;
