import { PathTreeInstance } from "../shared/types";

import { Path } from "./path";

class PathTreeNode {
  constructor(
    public path: string,
    public children: Record<string, PathTreeNode> = {}
  ) {}
}

class PathTree extends PathTreeNode implements PathTreeInstance {
  constructor(paths: string[] = []) {
    super("");

    this.createTree(paths);
  }

  private pushNode(node: PathTreeNode, [path, ...rest]: string[]): void {
    node.children[path] = node.children[path] || new PathTreeNode(path);

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

  private testRecursive(
    node: PathTreeNode,
    [path, ...rest]: string[]
  ): boolean {
    if (path in node.children) {
      return rest.length ? this.testRecursive(node.children[path], rest) : true;
    }

    return false;
  }

  public test(path: string): boolean {
    if (!Path.isValid(path)) {
      return false;
    }

    return this.testRecursive(this, Path.fromString(path));
  }

  public push(path: string): void {
    this.pushNode(this, Path.fromString(path));
  }
}

export { PathTree };
