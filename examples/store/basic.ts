import {
  autorun,
  observable,
  watch,
  configuration,
} from "../../packages/projectx";

configuration({
  develop: true,
});

class Account {
  public isAuthorized = true;

  changeAuth(auth: boolean) {
    this.isAuthorized = auth;
  }
}

class State {
  counter = 1;
  array = [10, 23];

  data: any = null;

  get mul() {
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

const state = observable.fromClass(State);
const stateObj = observable.fromObject(obj);

const account: Account = observable.fromClass(Account);

const map = observable.fromMap(new Map<number, number>());

console.log(state);
console.log(stateObj);
console.log(account);
console.log(map);

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

configuration;

watch(
  () => (state.counter > 3 ? stateObj.counter : state.counter),
  (val) => {
    console.log("watch: ", val);
  }
);

autorun(() => {
  console.log("trigger counter");
  div.innerText = `state: ${state.counter}`;
});

autorun(() => {
  console.log("trigger stateObj");
  div1.innerText = `stateObj: ${state.array.join()}`;
});

autorun(() => {
  console.log("trigger data");
  div2.innerText = `auth: ${JSON.stringify(state.data)}`;
});

autorun(() => {
  console.log("trigger acc");
  div3.innerText = `ss: ${JSON.stringify(Object.fromEntries(map.entries()))}`;
});

buttonPlus.addEventListener("click", () => {
  state.increment();
});

buttonMinus.addEventListener("click", () => {
  state.decrement();
});

buttonPlus2.addEventListener("click", () => {
  stateObj.counter++;
  // map.set(map.size, map.size ** 2);
});

buttonMinus2.addEventListener("click", () => {
  stateObj.counter--;
  // map.delete(map.size - 1);
});

buttonFetch.addEventListener("click", () => {
  state.fetch();
});

buttonPush.addEventListener("click", () => {
  state.push();
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
