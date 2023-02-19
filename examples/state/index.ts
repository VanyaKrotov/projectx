import State, { batch, combine } from "../../packages/state";

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
