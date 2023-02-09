import React from "react";
import { createRoot } from "react-dom/client";

import { observer } from "./modules";

//@ts-ignore
import { observable } from "projectx";

const root = createRoot(document.getElementById("root")!);

class State {
  counter = 0;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}

const state = observable.class(State);
const state2 = observable.class(State);

const Info = observer(({ state, i }: { state: State; i: string }) => {
  console.log(`render [Info-${i}]`);

  return <div>{state.counter}</div>;
});

const Increment = ({
  state: _state,
  postfix,
}: {
  state: State;
  postfix: string;
}) => {
  console.log(`render [Increment-${postfix}]`);

  return (
    <div>
      <Info state={_state} i={postfix} />
      <button onClick={() => _state.increment()}>+</button>
      <button onClick={() => _state.decrement()}>-</button>
    </div>
  );
};

console.log(state);

const App = () => {
  console.log("render [App]");

  return (
    <div>
      <Increment state={state} postfix="1" />
      {state.counter > 2 && state2.counter > -1 && (
        <Increment state={state2} postfix="2" />
      )}
    </div>
  );
};

const App_ = observer(App);

const app = <App_ />;

state.increment();

root.render(app);
