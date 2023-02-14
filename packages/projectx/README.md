# ProjectX.Store

_Библиотека для управления состояния приложения_

[![ Версия npm ](https://badge.fury.io/js/projectx.store.svg)](https://badge.fury.io/js/projectx.store-react)

## Установка

```
npm i projectx.store
```

## Документация

Полная документация расположена по [ссылке](https://github.com/VanyaKrotov/projectx/blob/main/README.md)

### Описание функций и классов

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
