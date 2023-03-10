# ProjectX

_Просто управляй состоянием_

[![ Версия npm ](https://badge.fury.io/js/projectx.store.svg)](https://badge.fury.io/js/projectx.store)
[![ Версия npm ](https://badge.fury.io/js/projectx.store.svg)](https://badge.fury.io/js/projectx.store-react)

---

## Введение

### ProjectX — это набор библиотек связанных целью повысить удобство и скорость разработки.

### Реализуемые подходы:

    1. создать состояние также легко как создать переменную;
    2. изменить состояние также легко как изменить переменную;
    3. экшены это методы состояния;
    4. использование ООП для сложных состояний;
    5. единая структура для отслеживаемого состояния и статической структуры данных;
    6. объединяй состояния между собой даже если одно из ниx создасться позже;

_Много маленьких состояний лучше одного большого монолита..._

Существующие решения:

- [projectx.store](https://github.com/VanyaKrotov/projectx/tree/main/packages/projectx) — менеджер состояний для приложения, работает по принципу библиотеки [MobX](https://github.com/mobxjs/mobx) но реализует некоторые вещи иначе.

- [projectx.store-react](https://github.com/VanyaKrotov/projectx/tree/main/packages/projectx-react) — библиотека позволяющая соединить отслеживаемые состояния `projectx.store` с реактивным подходом `react`.

## Установка

Основная библиотека. Набор всех необходимых функций и классов для создания отслеживаемого состояния и управления его реакциями.

```
npm i projectx.store
```

Коннектор для React. Функции связывающие состояние и изменения дерева React, также имеет методы для создания локальных состояний компонентов.

```
npm i projectx.store-react
```

## Документация

### Описание методов и классов

_projectx.store_

- `observable` - набор функций для создания состояний из различных структур данных.

- `observable.fromClass()` - создание экземпляра состояния из класса.

Пример:

```ts
class State {
  constructor(public counter = 0) {}

  public increment() {
    this.counter++;
  }

  public decrement() {
    this.counter--;
  }
}

// state => экемпляр отслеживаемого состояния
const state = observable.fromClass(State, 1);

console.log(state.counter);
// 1
```

- `observable.fromObject()` - создание состояния из объекта или экземпляра класса.

Пример:

```ts
class State {
  constructor(public counter = 0) {}

  public increment() {
    this.counter++;
  }

  public decrement() {
    this.counter--;
  }
}

// state и stateObj => экемпляры отслеживаемых состояний
const state = observable.fromObject(new State(1));
const stateObj = observable.fromObject({ counter: 2 });

console.log(state.counter);
// 1
console.log(stateObj.counter);
// 1
```

- `observable.fromArray()` - создание состояния из массива.

Пример:

```ts
// array => экемпляр отслеживаемого состояния массива
const array = observable.fromArray([1, 2, 3]);

console.log(array);
// [1, 2, 3]
```

- `observable.fromMap()` - создание состояния из `es6` коллекции ключ/значени.

Пример:

```ts
// map => экемпляр отслеживаемого состояния
const map = observable.fromMap(new Map<number, number>([[1, 2]]));

console.log(map);
// { 1 => 2 }
```

- `observable.fromSet()` - создание состояния из `es6` массива упорядоченных значений.

Пример:

```ts
// set => экемпляр отслеживаемого состояний массива уникальных значений
const set = observable.fromSet(new Set<number>([[1, 1, 2]]));

console.log(set);
// { 0 => 1, 1 => 2 }
```

- `when()` - функция ожидания изменения состояния захваченного контекстом в `true`.

Пример:

```ts
const state = observable.fromObject({
  counter: 1,
  inc() {
    this.counter++;
  },
  async when() {
    await when(() => this.counter > 2);

    this.counter = 101;
  },
});

cosole.log(state.counter);
state.inc();
cosole.log(state.counter);
state.when();
cosole.log(state.counter);
state.inc();
cosole.log(state.counter);

// Output
// 1
// inc()
// 2
// when()
// 2
// inc()
// 101
```

- `watch()` - функция отслежения изменений захваченных в контекст результатов вычислений.

Пример:

```ts
const state = observable.fromObject({
  counter: 1,
  inc() {
    this.counter++;
  },
});

watch(
  () => state.counter ** 2,
  (value, prev) => {
    console.log(value, prev);
  }
);

state.inc();
state.inc();

// Output
// 1 undefined
// inc()
// 4 2
// inc()
// 9 4
```

- `autorun()` - функция реагирования на изменения захваченных состояний.

Пример:

```ts
const state = observable.fromObject({
  counter: 1,
  inc() {
    this.counter++;
  },
});

autorun(() => {
  console.log(state.counter);
});

state.inc();
state.inc();

// Output
// 1
// inc()
// 2
// inc()
// 3
```

- `transaction()` - функция для объединения нескольких изменений в одип пакет для вызова реакциий.

Пример:

```ts
const state = observable.fromObject({
  counter: 1,
  inc() {
    this.counter++;
    this.counter++;
  },
});

autorun(() => {
  console.log(state.counter);
});

state.inc();

transaction(() => {
  state.inc();
});

// Output
// 1
// inc()
// 2
// 3
// transaction()
// 5
```

- `configurations({})` - функция для настройки параметров работы `projectx.store` в проекте.

  - `develop` - включает режим отладки библиотеки (в консоли будут выведены внутренние переменные и методы);

  - `equalResolver(a, b)` - устанавливает функцию для проверки изменения состояния. Значение по умолчанию: `(a, b) => a === b`;

_projectx.store-react_

- `observer()` - функция для создания узла отслеживания изменений состояний.

- `observerWithRef()` - также функция для создания узла отслеживания с поддержкой передачи _`React.Ref`_.

Пример:

```ts
class State {
  counter = 1;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}

const state = observable.fromObject(new State());

// use observer(...) or observerWithRef(...)
const Counter = observer(() => {
  console.log("render [Counter]");

  return (
    <div>
      <div>{state.counter}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
});

const App = () => {
  console.log("render [App]");

  return (
    <div>
      <Counter />
    </div>
  );
};

// Output
// render [App]
// render [Counter]
// increment()
// render [Counter]
// decrement()
// render [Counter]
```

- `useLocalObservable()` - react хук для создания лоокального состояния.

Пример:

```ts
class State {
  counter = 1;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}

const Counter = () => {
  const state = useLocalObservable(() => new State());
  console.log("render [Counter]");

  return (
    <div>
      <div>{state.counter}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const App = () => {
  console.log("render [App]");

  return (
    <div>
      <Counter />
    </div>
  );
};

// Output
// render [App]
// render [Counter]
// increment()
// render [Counter]
// decrement()
// render [Counter]
```

- `<LocalObserver />` - компонент для создания локального узла отслеживания реакций внутри JSX.

Пример:

```ts
class State {
  counter = 1;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}

const state = observable.fromObject(new State());

const Counter = () => {
  console.log("render [Counter]");

  return (
    <div>
      <LocalObserver>
        {() => {
          console.log("render [Local]");

          return <div>{state.counter}</div>;
        }}
      </LocalObserver>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const App = () => {
  console.log("render [App]");

  return (
    <div>
      <Counter />
    </div>
  );
};

// Output
// render [App]
// render [Counter]
// render [Local]
// increment()
// render [Local]
// decrement()
// render [Local]
```
