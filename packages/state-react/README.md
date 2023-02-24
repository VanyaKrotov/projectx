# ProjectX.State-React

[![npm version](https://badge.fury.io/js/projectx.state-react.svg)](https://badge.fury.io/js/projectx.state-react)

## Установка

```
npm i projectx.state-react
```

## Документация

<!-- Полная документация расположена по [ссылке](https://github.com/VanyaKrotov/projectx/blob/main/README.md) -->

### Описание функций

- `connect()` - функция связывающая изменения состояния с react компонентом;

- `connectWithRef()` - тоже что и `connect()`, только имеет возможность проброса `ref`;

Пример:

```tsx
const state = new CounterState();

interface Props {
  count: number;
}

const Increment: FC<Props> = ({ count }) => {
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const ConnectIncrement = connect(
  (state) => ({
    count: state.data.counter,
  }),
  state
)(Increment);
```

- `connectWatch()` - функция связывающая точечные мутации состояния с react компонентом;

- `connectWatchWithRef()` - тоже что и `connectWatchWithRef()`, только имеет возможность проброса `ref`;

Пример:

```tsx
const state = new CounterState();

interface Props {
  count: number;
}

const Increment: FC<Props> = ({ count }) => {
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};

const ConnectIncrement = connectWatch<[number], Props>(
  ["counter"],
  ([counter]) => ({ count: counter }),
  state
)(Increment);
```

- `useLocalState()` - react хук для создания локального состояния;

Пример:

```tsx
const Increment: FC = () => {
  const state = useLocalState(() => new CounterState());

  return (
    <div>
      <div>{state.counter}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};
```

- `useSelect()` - react хук для выбора данных из состояния с дальнейшим простушиванием изменений;

Пример:

```tsx
const state = new CounterState();

const selectCount = (state) => state.data.counter;

const Increment: FC = () => {
  // Внимание! Функция селектора является зависимостью на переподключение прослушивания. Используйте аннонимные функции созданные локально только когда они захватывают внетренний контекст компонента, в остальных случаях стоит сохранять их по ссылке.
  const count = useSelect(selectCount, state);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};
```

- `useWatch()` - react хук для подключения к прослушиванию точечного мутирования данных;

Пример:

```tsx
const state = new CounterState();

const Increment: FC = () => {
  // Внимание! Массив путей является зависимостью на переподключение прослушивания. Используйте создание массив в каждом рендере только когда они захватывают контекстные зависимости компонента, в остальных случаях стоит передавать массив по ссылке.
  const [count] = useWatch(["counter"], state);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};
```

- `useStateOrDefault()` - react хук ждя получения состояния из контекста, если нет состояния в контексте то состояние можно задать аргументом.

- `<SelectObserve />` - компонент для создания локального соедиения между компонентом и состоянием. При использовании `SelectObserve` ререндер вызываться только внутри функционального компонента переданного как дочерний компонент, перерендер компонентов в местах использования не будет вызнано;

Пример:

```tsx
const state = new CounterState();

const selectCount = (state) => state.data.counter;

const Increment: FC = () => (
  <div>
    <div>
      {/* Внимание! Функция селектора является зависимостью переподключения
          прослушивания. Используйте аннонимные функции созданные локально только
          когда они захватывают внутренний контекст компонента, в остальных
          случаях стоит передавать их по ссылке. */}
      <SelectObserve state={state} selector={selectCount}>
        {({ data }) => <>{data}</>}
      </SelectObserve>
    </div>
    <button onClick={() => state.increment()}>+</button>
    <button onClick={() => state.decrement()}>-</button>
  </div>
);
```

- `<WatchObserve />` - компонент для создания локальной подписки на точечные мутации состояния. При использовании `WatchObserve` ререндер вызываться только внутри функционального компонента переданного как дочерний компонент, перерендер компонентов в местах использования не будет вызнано;

Пример:

```tsx
const state = new CounterState();

const selectCount = (state) => state.data.counter;

const Increment: FC = () => (
  <div>
    <div>
      {/* Внимание! Массив путей является зависимостью на переподключение прослушивания. Используйте создание массив в каждом рендере только когда они захватывают контекстные зависимости компонента, в остальных случаях стоит передавать массив по ссылке. */}
      <WatchObserve<[number]> state={state} watch={["counter"]}>
        {({ data: [counter] }) => <>{counter}</>}
      </WatchObserve>
    </div>
    <button onClick={() => state.increment()}>+</button>
    <button onClick={() => state.decrement()}>-</button>
  </div>
);
```

- `<StateProvider />` - react провайдер для проброса состояния по дереву react. Имеет возможность доступа к родительскому состоянию при мозданиии вложенного провайдера.
  При наличии провайдера использование react компонентов и хуков может производится без передачи состояния, в этом случае будет выбрано состояние из ближайшего контекста.

Пример:

```tsx
const state = new CounterState();

const selectCount = (state) => state.data.counter;

const Increment: FC = () => (
  <div>
    <div>
      {/*Внимание! Массив путей является зависимостью на переподключение прослушивания. Используйте создание массив в каждом рендере только когда они захватывают контекстные зависимости компонента, в остальных случаях стоит передавать массив по ссылке. */}
      <WatchObserve<[number]> watch={["counter"]}>
        {({ data: [counter] }) => <>{counter}</>}
      </WatchObserve>
    </div>
    <button onClick={() => state.increment()}>+</button>
    <button onClick={() => state.decrement()}>-</button>
  </div>
);

const App = () => {
  return (
    <StateProvider state={() => state}>
      <Increment />
    </StateProvider>
  );
};
```

Все описанные выше функции работают как с отдельными состояниями так и с объединенными посредстром метода `combine()`.
