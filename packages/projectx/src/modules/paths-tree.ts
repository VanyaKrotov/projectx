import {
  ListenManagersResult,
  ManagerInstance,
  ObserverTypes,
  PathNodeInstance,
  PathsTreeInstance,
} from "shared/types";
import { isEqualArray } from "shared/utils";

import { rootManager } from "modules/initialize";

class PathNode implements PathNodeInstance {
  public children: Record<string, PathNodeInstance> = {};
  public listenTypes: ObserverTypes[] = [];

  constructor(public value: string, public manager: ManagerInstance) {}

  public get keys() {
    return Object.keys(this.children);
  }

  public push([path, ...paths]: string[]): void {
    const nextNode =
      this.children[path] ||
      new PathNode(path, this.manager!.manager(path)!);

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
        this.nodes[path] || new PathNode(path, rootManager.get(path));

      this.nodes[path].push(restPath);
    }

    for (const key in this.nodes) {
      this.linkingRec(this.nodes[key]);
    }
  }

  private linkingRec(node: PathNodeInstance) {
    const keys = Object.keys(node.children);
    if (!keys.length) {
      return (node.listenTypes = ["all"]);
    }

    node.listenTypes = isEqualArray(keys, node.manager!.keys)
      ? ["add", "change", "remove"]
      : ["change"];

    for (const key of keys) {
      this.linkingRec(node.children[key]);
    }
  }

  private optimizedRec(node: PathNodeInstance): ListenManagersResult[] {
    let result: ListenManagersResult[] = [
      { listenTypes: node.listenTypes, manager: node.manager! },
    ];
    if (!node.keys.length) {
      return result;
    }

    for (const key in node.children) {
      result = result.concat(this.optimizedRec(node.children[key]));
    }

    return result;
  }

  public getListenManagers(): ListenManagersResult[] {
    let result: ListenManagersResult[] = [];
    for (const key in this.nodes) {
      result = result.concat(this.optimizedRec(this.nodes[key]));
    }

    return result;
  }
}

export default PathTree;
