import State, { combine } from "../../packages/state/src";

/*

class CounterState extends State<{ counter: number }> {
  public readonly data = {
    counter: 0,
  };

  public increment() {
    this.change({ counter: this.data.counter + 1 });
  }

  public decrement() {
    this.change({ counter: this.data.counter - 1 });
  }
}

// counter structure:
// counter.increment() => function
// counter.decrement() => function
// counter.change() => function
// counter.reaction() => function
// counter.dispose() => function
// counter.data => object
const counter = new CounterState();

console.log(counter.data); // { counter: 0 }

counter.increment();

console.log(counter.data); // { counter: 1 }

counter.decrement();

console.log(counter.data); // { counter: 0 }

// Если массив селекторов пуст, реакция будет вызвана при каждой мутации объекта состояния
let unlisten = counter.reaction(
  [(state) => state.counter],
  (counter) => {
    console.log("reaction: ", counter);
  },
  {
    initCall: true, // default = false. Запускает вызов реакции при ее монтировании
    resolver: (a, b) => a === b, // default = (a, b) => a === b.
  }
);
// reaction: 0

counter.increment();
// reaction: 1

counter.decrement();
// reaction: 0

unlisten();

counter.increment();

class A extends State<{ val: number }> {
  public readonly data = {
    val: 1,
  };

  public increment() {
    this.change({ val: this.data.val + 1 });
  }
}

class B extends State<{ val: number }> {
  public readonly data = {
    val: 100,
  };

  public increment() {
    this.change({ val: this.data.val + 1 });
  }
}

const a = new A();
const b = new B();
const c = new B();

// comb structure:
// counter.change() => function
// counter.reaction() => function
// counter.dispose() => function
// counter.data => object
const comb = combine({
  a,
  b,
  c,
});

unlisten = comb.reaction(
  [(state) => state.a.val + state.b.val],
  (sum: number) => {
    console.log("reaction: ", sum);
  }
);

const unlistenc = comb.reaction([(state) => state.c.val], (value: number) => {
  console.log("reaction[c]: ", value);
});

a.increment();
// reaction: 102

b.increment();
// reaction: 103

c.increment();
// reaction[c]: 101

batch(() => {
  a.increment();
  a.increment();
  a.increment();
  a.increment();

  b.increment();
  b.increment();
  b.increment();
  b.increment();

  c.increment();
  c.increment();
  c.increment();
  c.increment();
});

// reaction:  111
// reaction[c]:  105

*/

class CounterState extends State<{ counter: number; array: string[] }> {
  public readonly data = {
    counter: 0,
    array: ["first", "second", "last"],
  };

  public increment() {
    this.change({ counter: this.data.counter + 1 });
  }

  public decrement() {
    this.change({ counter: this.data.counter - 1 });
  }

  public changeString() {
    this.commit([
      { path: "array.1", value: "last" },
      { path: "array.2", value: "second" },
    ]);
  }

  public restoreString() {
    this.commit([
      { path: "array.1", value: "second" },
      { path: "array.2", value: "last" },
    ]);

    setTimeout(() => {
      this.change({ array: ["1", "2", "3"] });
    }, 1000);
  }
}

class Test extends State<{ array: { value: number }[] }> {
  public data = {
    array: [{ value: 10 }, { value: 20 }],
  };

  public changeArray() {
    this.commit([{ path: "array.1.value", value: 2000 }]);
  }

  public restore() {
    this.commit([{ path: "array.1.value", value: 20 }]);
  }
}

const state = new CounterState();
const test = new Test();

const comb = combine({
  counter: state,
  test,
});

// comb.watch(["counter.counter"], () => {
//   console.log("watch[counter.counter]: ", comb.data.counter.counter);
// });

// comb.watch(["test.val"], () => {
//   console.log("watch[test.val]: ", comb.data.test.val);
// });

// state.reaction([(state) => state.counter], (counter) => {
//   console.log("reaction[counter]: ", counter);
// });

// state.watch(["counter"], () => {
//   console.log("watch[counter]: ", state.data.counter);
// });

// state.watch(["array.2"], () => {
//   console.log("watch[array.2]: ", state.data.array[2]);
// });

// state.watch(["array.1"], () => {
//   console.log("watch[array.1]: ", state.data.array[1]);
// });

// state.watch(["array"], () => {
//   console.log("watch[array]: ", state.data.array);
// });

// state.watch(["array.0"], () => {
//   console.log("watch[array[0]]: ", state.data.array[0]);
// });

// state.watch(new PathTree(["array.1", "array.2"]), () => {
//   console.log(
//     "watch[array.1|array.2]: ",
//     state.data.array[1],
//     state.data.array[2]
//   );
// });

const buttonPlus = document.createElement("button");
const buttonMinus = document.createElement("button");
const buttonTest1 = document.createElement("button");
const buttonTest2 = document.createElement("button");

const div = document.createElement("div");
const divTest = document.createElement("div");

buttonPlus.innerText = "+";
buttonMinus.innerText = "-";
buttonTest1.innerText = "test1";
buttonTest2.innerText = "test2";

comb.on(
  ["counter.counter"],
  () => {
    div.innerText = `counter: ${state.data.counter}`;
    console.log("counter");
  },
  { initCall: true, priority: 2 }
);

comb.once(["counter.counter"], () => {
  console.log("counter once");
});

comb.on(
  ["counter.array"],
  () => {
    console.log("counter.array");
  },
  { initCall: true }
);

comb.on(
  ["test.array"],
  () => {
    divTest.innerText = `test: ${JSON.stringify(test.data.array)}`;
    console.log("test.array");
  },
  { initCall: true }
);

buttonPlus.addEventListener("click", () => {
  state.increment();
});

buttonMinus.addEventListener("click", () => {
  state.decrement();
});

buttonTest1.addEventListener("click", () => {
  state.changeString();
  test.changeArray();
});

buttonTest2.addEventListener("click", () => {
  state.restoreString();
  test.restore();
});

async function main() {
  const res = await comb.when(
    ["counter.counter"],
    (data) => data.counter.counter > 3
  );

  console.log("main end", res);
}

main();

document.body.appendChild(div);
document.body.appendChild(divTest);

document.body.appendChild(buttonPlus);
document.body.appendChild(buttonMinus);
document.body.appendChild(buttonTest1);
document.body.appendChild(buttonTest2);
