import { describe, test, expect } from "@jest/globals";

import { combine } from "../combine";
import { State } from "../state";

describe("combine", () => {
  class A extends State<{ val: number }> {
    public readonly data = {
      val: 1,
    };

    public increment() {
      this.change({ val: this.data.val + 1 });
    }
  }

  class B extends State<{ val: number }> {
    public readonly data = {
      val: 100,
    };

    public increment() {
      this.change({ val: this.data.val + 1 });
    }
  }

  test("default", () => {
    const a = new A();
    const b = new B();
    const c = new B();

    const comb = combine({
      a,
      b,
    });

    const values: number[] = [];
    const unlisten = comb.reaction(
      [(state) => state.a.val + state.b.val],
      (res: number) => {
        values.push(res);
      }
    );

    expect(values.length).toBe(0);

    a.increment();
    b.increment();
    c.increment();

    expect(values.length).toBe(2);
    expect(values).toEqual([102, 103]);

    unlisten();

    a.increment();
    b.increment();

    expect(a.data.val).toBe(3);
    expect(b.data.val).toBe(102);
    expect(values.length).toBe(2);
    expect(values).toEqual([102, 103]);
  });
});
