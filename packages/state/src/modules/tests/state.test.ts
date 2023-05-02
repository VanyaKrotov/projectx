import { describe, test, expect } from "@jest/globals";

import { State } from "../state";

describe("State", () => {
  const DEFAULT_DATA = {
    counter: 0,
    test: "",
    array: ["1", "2", "3"],
  };

  class Counter extends State<{
    counter: number;
    test: string;
    array: string[];
  }> {
    public readonly data = {
      counter: 0,
      test: "",
      array: ["1", "2", "3"],
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
    let changeCount = 0;

    state.on(["counter"], () => {
      changeCount++;
    });

    expect(state.data).toEqual(DEFAULT_DATA);

    state.increment();
    state.increment();

    expect(state.data.counter).toBe(2);
    expect(changeCount).toBe(2);

    state.decrement();

    expect(state.data.counter).toBe(1);
    expect(changeCount).toBe(3);
  });

  test("commit", () => {
    const state = new Counter();
    let changeCount = 0;

    state.on(["counter"], () => {
      changeCount++;
    });

    expect(state.data).toEqual(DEFAULT_DATA);

    state.increment();
    state.increment();
    state.commit([{ path: "counter", value: 20 }]);

    expect(state.data.counter).toBe(20);
    expect(changeCount).toBe(3);

    state.decrement();

    expect(state.data.counter).toBe(19);
    expect(changeCount).toBe(4);
  });

  test("reaction", () => {
    const values: number[] = [];
    let tests = "";
    const state = new Counter();

    expect(state.data).toEqual(DEFAULT_DATA);

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

    expect(state.data).toEqual({
      counter: 0,
      test: "test",
      array: ["1", "2", "3"],
    });
    expect(value.length).toBe(3);
    expect(value).toEqual([1, 2, 3]);
  });

  test("watch", () => {
    let test = "";
    const value: string[] = [];
    const arr: string[] = [];
    const state = new Counter();

    state.on(["test"], () => {
      test += state.data.test;
    });

    state.on(["counter"], () => {
      value.push(String(state.data.counter));
    });

    state.on(["array.0"], () => {
      arr.push(state.data.array[0]);
    });

    state.change({ test: "1" });
    expect(test).toBe("1");
    expect(value.length).toBe(0);
    expect(arr.length).toBe(0);

    state.change({ test: "2" });
    expect(test).toBe("12");
    expect(value.length).toBe(0);
    expect(arr.length).toBe(0);

    state.commit([{ path: "counter", value: 4 }]);
    expect(value.length).toBe(1);
    expect(test).toBe("12");
    expect(arr.length).toBe(0);

    state.commit([{ path: "array.0", value: "4" }]);
    expect(value.length).toBe(1);
    expect(test).toBe("12");
    expect(arr.length).toBe(1);

    state.commit([{ path: "array", value: ["4"] }]);
    expect(value.length).toBe(1);
    expect(test).toBe("12");
    expect(arr.length).toBe(2);
  });
});
