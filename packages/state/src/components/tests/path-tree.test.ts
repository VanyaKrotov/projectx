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

  test("test", () => {
    const tree = new PathTree(["node.0.test", "test", "test.0"]);

    expect(tree.test("node")).toBe(true);
    expect(tree.test("test")).toBe(true);
    expect(tree.test("test.0")).toBe(true);
    expect(tree.test("test.10")).toBe(false);
    expect(tree.test("value")).toBe(false);
    expect(tree.test("test.0.value")).toBe(false);
    expect(tree.test("node.0.value")).toBe(false);
  });
});
