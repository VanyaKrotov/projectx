import toPath from "lodash/toPath";
import isEmpty from "lodash/isEmpty";

class PathTreeNode {
  public point = false;

  constructor(
    public path: string,
    public children: Record<string, PathTreeNode> = {}
  ) {}

  public get isEmpty(): boolean {
    return isEmpty(this.children);
  }
}

class PathTree extends PathTreeNode {
  constructor(paths: string[] = []) {
    super("");

    this.createTree(paths);
  }

  public static pushPrefix(path: string, node: PathTreeNode): PathTree {
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
      this.pushNode(this, toPath(path));
    }
  }

  public push(path: string): void {
    this.pushNode(this, toPath(path));
  }

  private includesRecursive(
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

      if (this.includesRecursive(watch.children[key], change.children[key])) {
        return true;
      }
    }

    return false;
  }

  public includes(node: PathTreeNode): boolean {
    if (node.isEmpty) {
      return this.isEmpty;
    }

    return this.includesRecursive(this, node);
  }
}

export { PathTree, PathTreeNode };
