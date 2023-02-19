import { describe, test, expect } from "@jest/globals";

import State from "../state";

describe("State", () => {
  class Counter extends State<{ counter: number; test: string }> {
    public readonly data = {
      counter: 0,
      test: "",
    };

    public increment() {
      this.change({ counter: this.data.counter + 1 });
    }

    public decrement() {
      this.change({ counter: this.data.counter - 1 });
    }

    public joinToTest(value: string) {
      this.change({ test: this.data.test + value });
    }
  }

  test("change", () => {
    const state = new Counter();

    expect(state.data).toEqual({ counter: 0, test: "" });

    state.increment();
    state.increment();

    expect(state.data.counter).toBe(2);

    state.decrement();

    expect(state.data.counter).toBe(1);
  });

  test("reaction", () => {
    const values = [];
    let tests = "";
    const state = new Counter();

    expect(state.data).toEqual({ counter: 0, test: "" });

    const unlistenCounter = state.reaction(
      [(state) => state.counter],
      (counter: number) => {
        values.push(counter);
      }
    );

    const unlistenTest = state.reaction(
      [(state) => state.test],
      (value: string) => {
        tests = value;
      }
    );

    state.increment();
    state.increment();

    state.joinToTest("1");

    state.joinToTest("2");

    expect(values.length).toBe(2);
    expect(tests.length).toBe(2);

    unlistenCounter();

    state.decrement();

    expect(state.data.counter).toBe(1);
    expect(state.data.test).toBe("12");

    state.joinToTest("end");

    expect(state.data.test).toBe("12end");
    expect(tests).toBe("12end");

    unlistenTest();

    state.joinToTest("1");

    expect(state.data.test).toBe("12end1");
    expect(tests).toBe("12end");
  });

  test("reaction [empty selectors]", () => {
    const value: number[] = [];
    const state = new Counter();

    state.reaction([], () => {
      value.push(value.length + 1);
    });

    expect(value.length).toBe(0);

    state.increment();
    state.decrement();
    state.joinToTest("test");

    expect(state.data).toEqual({ counter: 0, test: "test" });
    expect(value.length).toBe(3);
    expect(value).toEqual([1, 2, 3]);
  });
});
