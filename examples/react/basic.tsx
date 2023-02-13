import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { observable } from "projectx.store";
import {
  LocalObserver,
  observer,
  useLocalObservable,
} from "projectx.store-react";

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

const state1 = observable.fromClass(State);
const state2 = observable.fromClass(State);

console.log(state1);

const Info = observer(({ state, i }: { state: State; i: string }) => {
  console.log(`render [Info-${i}]`);

  useEffect(() => {
    console.log(`mount [Info-${i}]`);
  }, []);

  return <div>{state.counter}</div>;
});

const Increment = ({ state, postfix }: { state: State; postfix: string }) => {
  console.log(`render [Increment-${postfix}]`);

  useEffect(() => {
    console.log(`mount [Increment-${postfix}]`);
  }, []);

  return (
    <div>
      <Info state={state} i={postfix} />
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const Test = () => {
  const data = useLocalObservable(() => new State());

  return <Increment state={data} postfix="state" />;
};

const App = () => {
  console.log("render [App]");

  useEffect(() => {
    console.log("mount [App]");
  }, []);

  return (
    <div>
      <Test />
      <Increment state={state1} postfix="1" />
      <LocalObserver>
        {() => (
          <>
            {state1.counter > 2 && state2.counter > -1 && (
              <Increment state={state2} postfix="2" />
            )}
          </>
        )}
      </LocalObserver>
    </div>
  );
};

root.render(<App />);
