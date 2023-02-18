import { watch, State, watchGroup, createSelector } from "../../packages/state";

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

watch(
  state,
  (state) => state.counter,
  (counter) => {
    console.log("change: ", counter);
  }
);

const joinSelector = createSelector(
  [
    (state1: CounterState) => state1.counter,
    (_s1, state2: DatesState) => state2.array[0],
  ],
  (counter, date) => {
    return `${counter} - ${date}`;
  }
);

watchGroup([state, dates], [joinSelector], (str) => {
  console.log("group: ", str);
});

const buttonInc = document.createElement("button");
const buttonDec = document.createElement("button");
const buttonTest = document.createElement("button");

buttonInc.innerText = "inc";
buttonDec.innerText = "dec";
buttonTest.innerText = "test";

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
