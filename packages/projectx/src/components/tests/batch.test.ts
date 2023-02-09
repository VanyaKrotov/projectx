import { describe, test, expect } from "@jest/globals";

import Batch from "../batch";

describe("Batch", () => {
  const batch = new Batch();

  test("Default", () => {
    const res: string[] = [];

    expect(res.length).toBe(0);

    batch.open();

    const action = () => {
      res.push("action 1");
    };

    const action2 = () => {
      res.push("action 2");
    };

    batch.action(action);
    batch.action(action);

    batch.action(action2);
    batch.action(action2);

    expect(res.length).toBe(0);

    batch.close();

    expect(res.length).toBe(2);
    expect(res).toEqual(["action 1", "action 2"]);
  });

  test("Nesting", () => {
    const res: string[] = [];

    expect(res.length).toBe(0);

    batch.open();

    const action = () => {
      res.push("action 1");
    };

    batch.action(action);
    batch.action(action);

    const action2 = () => {
      res.push("action 2");
    };

    batch.open();

    batch.action(action2);
    batch.action(action2);

    batch.close();

    expect(res.length).toBe(1);

    batch.close();

    expect(res.length).toBe(2);
    expect(res).toEqual(["action 2", "action 1"]);
  });
});
