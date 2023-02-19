# ProjectX.State-React

[![ Версия npm ](https://badge.fury.io/js/projectx.state-react.svg)](https://badge.fury.io/js/projectx.state-react)

## Установка

```
npm i projectx.state-react
```

## Документация

<!-- Полная документация расположена по [ссылке](https://github.com/VanyaKrotov/projectx/blob/main/README.md) -->

### Описание функций

- `connect()` - функция связывающая изменения состояния с реакт компонентом;

- `connectWithRef()` - тоже что и `connect`, только имеет возможность проброса `ref`;

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

const ConnectIncrement = connect(state, (state) => ({
  count: state.data.counter,
}))(Increment);
```

- `useSelect()` - react хук для выбора данных из состояния с дальнейшим простушиванием изменений;

Пример:

```tsx
const state = new CounterState();

const selectCount = (state) => state.data.counter;

const Increment: FC = () => {
  // Внимание! Функция селектора является зависимостью на переподключение прослушивания. Используйте аннонимные функции созданные локально только когда они захватывают внетренний контекст компонента, в остальных случаях стоит сохранять их по ссылке.
  const count = useSelect(state, selectCount);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => state.increment()}>+</button>
      <button onClick={() => state.decrement()}>-</button>
    </div>
  );
};
```

- `<Observe />` - компонент для создания локального соедиения между компонентом и состоянием. При использовании `Observe` ререндер вызываться только внутри функционального компонента переданного как дочерний компонент, перерендер компонентов в местах использования не будет вызнано;

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
      <Observe state={state} selector={selectCount}>
        {({ data }) => <>{data}</>}
      </Observe>
    </div>
    <button onClick={() => state.increment()}>+</button>
    <button onClick={() => state.decrement()}>-</button>
  </div>
);
```

Все описанные выше функции работают как с отдельными состояниями так и с объединенными посредстром метода `combine`.
