# ProjectX.Store-React

_Библиотека объединения функционала отслеживаемого состояния с реактивностью_

[![ Версия npm ](https://badge.fury.io/js/projectx.store.svg)](https://badge.fury.io/js/projectx.store-react)

## Установка

```
npm i projectx.store-react
```

## Документация

Полная документация расположена по [ссылке](https://github.com/VanyaKrotov/projectx/blob/main/README.md)

### Описание функций

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
