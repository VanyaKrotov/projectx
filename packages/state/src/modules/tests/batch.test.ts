import { describe, test, expect } from "@jest/globals";
import { batch } from "../batch";

import { State } from "../state";

describe("batch", () => {
  class Counter extends State<{ counter: number }> {
    public readonly data = {
      counter: 0,
    };

    public increment() {
      this.change({ counter: this.data.counter + 1 });
    }

    public decrement() {
      this.change({ counter: this.data.counter - 1 });
    }
  }

  test("one state", () => {
    const values: number[] = [];
    const state = new Counter();

    expect(state.data).toEqual({ counter: 0 });
    expect(values.length).toBe(0);

    state.reaction([(state) => state.counter], (value: number) => {
      values.push(value);
    });

    state.increment();
    state.increment();

    expect(state.data.counter).toBe(2);
    expect(values.length).toBe(2);

    batch(() => {
      state.increment();
      state.increment();
      state.increment();
      state.increment();
    });

    expect(state.data.counter).toBe(6);
    expect(values.length).toBe(3);
    expect(values).toEqual([1, 2, 6]);
  });

  test("many states", () => {
    const values1: number[] = [];
    const values2: number[] = [];
    const state1 = new Counter();
    const state2 = new Counter();

    expect(state1.data).toEqual({ counter: 0 });
    expect(state2.data).toEqual({ counter: 0 });
    expect(values1.length).toBe(0);
    expect(values2.length).toBe(0);

    state1.reaction([(state) => state.counter], (value: number) => {
      values1.push(value);
    });

    state2.reaction([(state) => state.counter], (value: number) => {
      values2.push(value);
    });

    state1.increment();
    state2.increment();

    expect(state1.data.counter).toBe(1);
    expect(state2.data.counter).toBe(1);
    expect(values1.length).toBe(1);
    expect(values2.length).toBe(1);

    batch(() => {
      state1.increment();
      state2.increment();
      state1.increment();
      state2.increment();
    });

    expect(state1.data.counter).toBe(3);
    expect(state2.data.counter).toBe(3);
    expect(values1.length).toBe(2);
    expect(values2.length).toBe(2);
    expect(values1).toEqual([1, 3]);
    expect(values2).toEqual([1, 3]);
  });
});
