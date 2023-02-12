import { autorun, observable, dependencyInject } from "./index";

class Account {
  public isAuthorized = true;

  changeAuth(auth: boolean) {
    this.isAuthorized = auth;
  }
}

class BaseState {
  counter = 1;
  array = [10, 23];

  map = new Map<number, Account>();
  set = new Set<Account>();

  get mul() {
    return this.counter * 2;
  }

  pushAccount(id: number, account: Account) {
    this.map.set(id, account);
    this.set.add(account);
  }
}

const account = observable.fromClass(Account);

const map = observable.fromMap(new Map<number, Account>([[1, new Account()]]));
const set = observable.fromSet(new Set<Account>([new Account()]));

console.log(account);
console.log(map);

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
  console.log("trigger map");
  div3.innerText = `map: ${JSON.stringify(Array.from(state.map.entries()))}`;
});

autorun(() => {
  console.log("trigger set");
  div2.innerText = `set: ${JSON.stringify(Array.from(state.set))}`;
});

buttonPlus.addEventListener("click", () => {
  state.increment();
});

buttonMinus.addEventListener("click", () => {
  state.decrement();
});

buttonPlus2.addEventListener("click", () => {
  // stateObj.inc();

  // map.get(1)?.changeAuth(false);

  state.pushAccount(1, new Account());

  // set.forEach((e) => e.changeAuth(false));

  // map.set(map.size + 1, "test " + map.size);
});

buttonMinus2.addEventListener("click", () => {
  // stateObj.dec();
  // set.clear();
  // map.delete(map.size);

  state.set.clear();
  state.map.clear();
});

buttonFetch.addEventListener("click", () => {
  state.fetch();
  map.set(1, new Account());
  set.add(new Account());
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
