import { autorun, observable, dependencyInject } from "./index";

class BaseState {
  counter = 1;
  array = [10, 23];

  get mul() {
    return this.counter * 2;
  }
}

class Account {
  public isAuthorized = true;

  changeAuth(auth: boolean) {
    this.isAuthorized = auth;
  }
}

const account = observable.fromClass(Account);

console.log(account);

class State extends BaseState {
  private readonly account = dependencyInject(Account);

  increment() {
    this.counter++;

    this.account.changeAuth(false);
  }

  decrement() {
    this.counter--;
  }

  fetch() {
    this.array[0] = this.counter + 1;
  }

  push() {
    this.counter++;
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

console.log(state);
console.log(stateObj);

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

autorun(() => {
  console.log("trigger counter");
  div.innerText = `state: ${state.counter}`;
});

autorun(() => {
  console.log("trigger stateObj");
  div1.innerText = `stateObj: ${stateObj.test}`;

});

autorun(() => {
  console.log("trigger auth");
  div3.innerText = `auth: ${account.isAuthorized}`;
});

autorun(() => {
  console.log("trigger counter");
  div2.innerText = `base: ${state.counter}`;
});

buttonPlus.addEventListener("click", () => {
  state.increment();
});

buttonMinus.addEventListener("click", () => {
  state.decrement();
});

buttonPlus2.addEventListener("click", () => {
  stateObj.inc();
});

buttonMinus2.addEventListener("click", () => {
  stateObj.dec();
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
