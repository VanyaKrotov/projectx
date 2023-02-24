import { describe, test, expect } from "@jest/globals";
import { PathTree } from "../path-tree";

describe("PathTree", () => {
  test("constructor", () => {
    const tree = new PathTree(["node.0.test", "test", "test.0"]);

    expect(tree.children.node.path).toBe("node");
    expect(tree.children.node.children["0"].path).toBe("0");
    expect(tree.children.test.path).toBe("test");
    expect(tree.children.test.children["0"].path).toBe("0");
  });

  test("includes", () => {
    const watchTree = new PathTree(["array", "state.value", "array.1.test"]);

    expect(watchTree.includes(new PathTree(["array.0", "count"]))).toBe(true);
    expect(watchTree.includes(new PathTree(["state.value"]))).toBe(true);
    expect(watchTree.includes(new PathTree(["array"]))).toBe(true);
    expect(watchTree.includes(new PathTree(["array.30.test"]))).toBe(true);
    expect(new PathTree().includes(new PathTree())).toBe(true);
    expect(watchTree.includes(new PathTree(["array", "state.value"]))).toBe(true);
    expect(new PathTree(["obj"]).includes(new PathTree(["obj.value"]))).toBe(true);
    expect(new PathTree(["obj.value"]).includes(new PathTree(["obj"]))).toBe(true);

    expect(new PathTree(["obj.test"]).includes(new PathTree(["obj.value"]))).toBe(
      false
    );
    expect(watchTree.includes(new PathTree(["counter"]))).toBe(false);
    expect(watchTree.includes(new PathTree([]))).toBe(false);

    expect(watchTree.includes(new PathTree(["array.0"]))).toBe(true);

    expect(
      new PathTree(["state.value", "array.1.test"]).includes(
        new PathTree(["array"])
      )
    ).toBe(true);
    expect(new PathTree(["state.value"]).includes(new PathTree(["state.value.array.0"]))).toBe(
      true
    );
  });
});
