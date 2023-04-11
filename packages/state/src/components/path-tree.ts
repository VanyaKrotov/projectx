import { isEmptyObject } from "../shared/utils";
import type { PathTreeInstance, PathTreeNodeInstance } from "../shared/types";

import { Path } from "./path";

class PathTreeNode implements PathTreeNodeInstance {
  public point = false;

  constructor(
    public path: string,
    public children: Record<string, PathTreeNode> = {}
  ) {}

  public get isEmpty(): boolean {
    return isEmptyObject(this.children);
  }
}

class PathTree extends PathTreeNode implements PathTreeInstance {
  constructor(paths: string[] = []) {
    super("");

    this.createTree(paths);
  }

  public static pushPrefix(path: string, node: PathTreeNode): PathTreeInstance {
    const tree = new PathTree();

    tree.children[path] = new PathTreeNode(path, node.children);

    return tree;
  }

  private pushNode(node: PathTreeNode, [path, ...rest]: string[]): void {
    if (path in node.children) {
      node.children[path].point = true;
    } else {
      node.children[path] = new PathTreeNode(path);
    }

    if (rest.length) {
      return this.pushNode(node.children[path], rest);
    }
  }

  private createTree(paths: string[]): void {
    for (const path of paths) {
      if (!Path.isValid(path)) {
        console.assert(false, `[px.state] Path \`${path}\` is not valid!`);

        continue;
      }

      this.pushNode(this, Path.fromString(path));
    }
  }

  public push(path: string): void {
    this.pushNode(this, Path.fromString(path));
  }

  private testTreeRecursive(
    watch: PathTreeNode,
    change: PathTreeNode
  ): boolean {
    if (
      watch.point ||
      (watch.isEmpty && change.isEmpty) ||
      change.isEmpty != watch.isEmpty
    ) {
      return true;
    }

    for (const key in watch.children) {
      if (!(key in change.children)) {
        continue;
      }

      if (this.testTreeRecursive(watch.children[key], change.children[key])) {
        return true;
      }
    }

    return false;
  }

  public includes(node: PathTreeNodeInstance): boolean {
    if (node.isEmpty) {
      return this.isEmpty;
    }

    return this.testTreeRecursive(this, node);
  }
}

export { PathTree };
