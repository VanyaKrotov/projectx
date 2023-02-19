# ProjectX.State

_Библиотека для управления состояниями_

[![ Версия npm ](https://badge.fury.io/js/projectx.state.svg)](https://badge.fury.io/js/projectx.state)

## Установка

```
npm i projectx.state
```

## Документация

Полная документация расположена по [ссылке](https://github.com/VanyaKrotov/projectx/blob/main/README.md)

### Описание функций и классов

- `State` - базовый класс для создания состояний.

  - `data = {}` - основное хранилище состояния (_readonly_);

  - `change()` - метод для мутации состояния;

  - `reaction()` - метод для отслеживания мутаций состояния;

  - `dispose()` - метод для сброса всех отслеживаний состояния;

Пример:

```ts
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
const unlisten = counter.reaction(
  [(state) => state.counter],
  (counter) => {
    console.log("reaction: ", counter);
  },
  {
    initCall: true, // default = false. Запускает вызов реакции при ее монтировании
    resolver: (a, b) => a === b, // default = (a, b) => a === b.
  }
);

counter.increment();
// reaction: 1

counter.decrement();
// reaction: 0

unlisten();

counter.increment();
```

- `combine()` - функция для объединения нескольких состояний в одно с единым центром отслеживания реакций.

Пример:

```ts
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

const unlisten = comb.reaction(
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
```
