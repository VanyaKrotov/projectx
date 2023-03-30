import { autorun, subscribe, makeObservable } from "../../packages/observable";

class Account {
  public isAuthorized = true;

  changeAuth(auth: boolean) {
    this.isAuthorized = auth;
  }
}

class BaseState {
  array = [10, 23];
}

const account = makeObservable(new Account());

class State extends BaseState {
  counter = 1;

  data: any = null;

  get mul() {
    console.log("mul");
    return this.counter * 2;
  }

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }

  async fetch() {
    this.data = {
      value: 10,
      next: {
        value: 12,
      },
    };

    this.array.pop();
  }

  push() {
    this.data = null;
    this.array.push(this.array.length + 1);
  }
}

const obj = {
  counter: 1,
  inc() {
    this.counter++;
  },
  dec() {
    this.counter--;
  },
  get test() {
    console.log("test");
    return this.counter * 2;
  },
};

const state = makeObservable(new State());

// const stateObj = makeObservable(obj);

const map = makeObservable(new Map<number, number>([[1, 12]]));

const set = makeObservable(new Set([1, obj, 3]));

const array = makeObservable([set, map, state]);

// console.log(state);
// console.log(stateObj, obj);
// console.log(set);
// console.log(account);
// console.log(map);
// console.log(array);

const div = document.createElement("div");
const div1 = document.createElement("div");
const div2 = document.createElement("div");
const div3 = document.createElement("div");
const buttonPlus = document.createElement("button");
const buttonMinus = document.createElement("button");
const buttonPlus2 = document.createElement("button");
const buttonMinus2 = document.createElement("button");
const buttonFetch = document.createElement("button");
const buttonPush = document.createElement("button");

buttonMinus.innerText = "-";
buttonPlus.innerText = "+";
buttonPlus2.innerText = "+";
buttonMinus2.innerText = "-";
buttonFetch.innerText = "fetch";
buttonPush.innerText = "push";

subscribe(array, (event) => {
  console.log(array);
  console.log(event.snapshot());
});

// watch(
//   () => (state.counter > 3 ? stateObj.counter : state.counter),
//   (val) => {
//     console.log("watch: ", val);
//   }
// );

autorun(() => {
  console.log("counter");
  div1.innerText = `state: ${state.counter}`;
});

// autorun(() => {
//   console.log("trigger mul");
//   div1.innerText = `state: ${JSON.stringify(state.array)}`;
// });

// autorun(() => {
//   console.log("trigger stateObj");
//   div1.innerText = `stateObj: ${state.array.join()}`;
// });

// autorun(() => {
//   console.log("trigger set");
//   div2.innerText = `set: ${JSON.stringify(Array.from(set.values()))}`;
// });

// autorun(() => {
//   console.log("trigger acc");
//   // console.log(map.entries());
//   div3.innerText = `ss: ${map.size}`;
// });

buttonPlus.addEventListener("click", () => {
  state.increment();
});

buttonMinus.addEventListener("click", () => {
  state.decrement();
});

buttonPlus2.addEventListener("click", () => {
  map.set(map.size + 1, map.size ** 2);
});

buttonMinus2.addEventListener("click", () => {
  map.delete(map.size);
});

buttonFetch.addEventListener("click", () => {
  // state.array.pop();
  state.array.pop();
});

buttonPush.addEventListener("click", () => {
  state.array.push(state.array.length);
});

document.body.appendChild(div);
document.body.appendChild(div1);
document.body.appendChild(div2);
document.body.appendChild(div3);
document.body.appendChild(buttonPlus);
document.body.appendChild(buttonMinus);
document.body.appendChild(buttonPlus2);
document.body.appendChild(buttonMinus2);
document.body.appendChild(buttonFetch);
document.body.appendChild(buttonPush);
