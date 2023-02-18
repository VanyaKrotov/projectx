import { watch, State, combine } from "../../packages/state";

interface CounterState {
  counter: number;
  test: number;
}

interface DatesState {
  array: string[];
}

class Counter extends State<CounterState> {
  public state = {
    counter: 0,
    test: 1,
  };

  public increment() {
    this.change({
      counter: this.state.counter + 1,
    });
  }

  public decrement() {
    this.change({ counter: this.state.counter - 1 });
  }

  public test() {
    this.change({
      test: this.state.test + 1,
    });
  }
}

class Dates extends State<DatesState> {
  public state: DatesState = {
    array: [],
  };

  push() {
    this.change({
      array: this.state.array.concat([new Date().toString()]),
    });
  }
}

const state = new Counter();
const dates = new Dates();

console.log(state);

const combineState = combine({
  counter: state,
  dates,
});

console.log(combineState);

const div = document.createElement("div");
const buttonInc = document.createElement("button");
const buttonDec = document.createElement("button");
const buttonTest = document.createElement("button");

watch(
  combineState,
  (state) => state.counter.counter,
  (counter) => {
    div.innerText = `counter: ${counter}`;
  },
  {
    initCall: true,
  }
);

buttonInc.innerText = "inc";
buttonDec.innerText = "dec";
buttonTest.innerText = "test";

document.body.appendChild(div);
document.body.appendChild(buttonInc);
document.body.appendChild(buttonDec);
document.body.appendChild(buttonTest);

buttonInc.addEventListener("click", () => {
  state.increment();
  dates.push();
});

buttonDec.addEventListener("click", () => {
  state.decrement();
});

buttonTest.addEventListener("click", () => {
  state.test();
});
