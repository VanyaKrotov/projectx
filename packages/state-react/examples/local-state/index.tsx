import React from "react";

import State from "projectx.state";

import { useLocalState, useSelect } from "../../src";

class CounterState extends State<{ counter: number }> {
  public data: { counter: number } = {
    counter: 0,
  };

  public increment() {
    this.change({ counter: this.data.counter + 1 });
  }

  public decrement() {
    this.change({ counter: this.data.counter - 1 });
  }
}

const LocalState = () => {
  const state = useLocalState(() => new CounterState());

  return (
    <div>
      <div>{state.data.counter}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const LocalStateStrict = () => {
  const state = useLocalState(() => new CounterState(), { mode: "strict" });

  const count = useSelect((s) => s.data.counter, state);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

export { LocalStateStrict, LocalState };
