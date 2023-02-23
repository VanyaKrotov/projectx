# ProjectX.State

[![ Версия npm ](https://badge.fury.io/js/projectx.state.svg)](https://badge.fury.io/js/projectx.state)

## Установка

```
npm i projectx.state
```

## Документация

### Описание функций и классов

- `State` - базовый класс для создания состояний.

  - `data = {}` - основное хранилище состояния (_readonly_);

  - `change()` - метод для мутации состояния;

  - `commit()` - метод для мутации состояния посредством точечного внесения изменений;

  - `reaction()` - метод для отслеживания мутаций состояния с использованием мемоизации вычисляемых данных;

  - `watch()` - метод для отслеживания точечных мутаций определенных полей состояния;

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
// counter.commit() => function
// counter.reaction() => function
// counter.watch() => function
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

- `combine()` - функция для объединения нескольких состояний в одно с единым центром отслеживания реакций и без возможности изменения данных.

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
// counter.reaction() => function
// counter.watch() => function
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

- `batch()` - функция объединяющая мутации одного или более состояний.

Пример:

```ts
/* ... states from  previous example */

const a = new A();
const b = new B();
const c = new B();

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
```

- `PathTree` - класс для создания дерева точечных отслеживаний. (необходимо для метода `watch`)

  - `push()` - добавляет путь в дерево;

  - `test()` - сопоставляет пути мутации с отслеживаемыми данными. Возвращает `true` если мутация влекет за собой изменение отслеживаемого поля.

Пример:

```ts
const tree = new PathTree(["array.0", "test.value"]);

tree.test("array.1"); // false
tree.test("array.0"); // true
tree.test("test.value"); // true
tree.test("test"); // true
tree.test("array"); // true
```

- `Path` - статический класс предоставляющий набор методов для работы с путями мутаций.

  - `get()` - получает значние поля по пути для объекта;

  - `set()` - мутирует значние поля по пути для объектов;

  - `isValid()` - проверяет валидность строки пути;

  - `toString()` - объединяет путь представленный как коллекцию в строку;

  - `fromString()` - разбивает строковый путь в вид коллекции;

  - `toLodashPath()` - переводит строковый путь `projectx.state` в [lodash](https://github.com/lodash/lodash) path;

Пример:

```ts
Path.get({ value: 10, next: { value: 11 } }, "value"); // 10
Path.get({ value: 10, next: { value: 11 } }, "next.value"); // 11
Path.get({ value: 10, next: { value: 11, next: null } }, "next.next.value"); // null

const obj = { value: 10, next: { value: 11, next: null } };

Path.set(obj, "next.value", 20); // true
// obj => { value: 10, next: { value: 20, next: null } }
Path.set(obj, "next.next.value", 20); // false
// obj => { value: 10, next: { value: 11, next: null } }

Path.isValid("path."); // false
Path.isValid("path.0"); // true
Path.isValid("path.0.test"); // true
Path.isValid(".path.0.test"); // false
Path.isValid("path[0].test"); // false

Path.toString(["next", "value"]); // 'next.value'
Path.fromString("next.value"); // ["next", "value"]

Path.toLodashPath("value.array.0.test"); // value.array[0].test
```

## Особые возможности

### В случае необходимости добавления промежуточных слоев для состояний это можно реализовать посредстром переопределения методов состояния.

Пример:

```ts
// Если необходимо по достижению определенного значения останавливать мутации
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

  public change(value: Partial<{ counter: number }>): void {
    if (value.counter && value.counter > 10) {
      return;
    }

    return super.change(value);
  }
}

// Если необходимо останавливать отслеживания изменений определенных полей после мутации
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

  public emit(event: ObserverEvent): void {
    if (event.paths.includes("counter") && this.data.counter > 5) {
      return;
    }

    return super.emit(event);
  }
}
```
