import React, { FC } from "react";

import CodeView from "components/code-view";

import Toolbar from "../toolbar";

interface Props {
  section: string;
}

const EXAMPLE_1 = `import State from 'projectx.state'

class CounterState extends State<{ counter: number; }> {
  public readonly data = {
    counter: 0
  };
}
`;

const EXAMPLE_2 = `import State, { batch, combine } from 'projectx.state'

class DataState extends State<{ data: string; }> {
  public readonly data = {
    data: "test data"
  };

  public updateData(data: string) {
    this.change({ data });
  }
}

class AccountState extends State<{ auth: boolean; }> {
  public readonly data = {
    auth: false
  };

  public login() {
    this.change({ auth: true });
  }

  public logout() {
    this.change({ auth: false });
  }
}

const data = new DataState();
const account = new AccountState();

const state = combine({
  data,
  account
});

state.watch(['account.auth'], () => {
  console.log('auth: ', state.data.account.auth);
});
`;

const Install: FC<Props> = ({ section }) => {
  return (
    <div className="section">
      <h1>Инструкция по установке</h1>
      <p>
        Прежде чем вы начнете использовать библиотеку, вам необходимо освоить
        основы фронтенд-разработки и принципами{" "}
        <a href="https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D0%BE%D0%B5_%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5">
          реактивного программирования
        </a>
        .
      </p>

      <br />

      <div>
        <h2>Используя npm</h2>
        <p>Для установки выполните команду в своем проекте:</p>
        <CodeView>npm i projectx.state</CodeView>
      </div>

      <br />

      <div>
        <h2>Импорт и использование</h2>
        <p>
          Для создания вашего состояния необходимо импортировать базовый класс.
          Структура базового класса экспортируется по умолчанию.
        </p>
        <CodeView>{EXAMPLE_1}</CodeView>

        <p>Все оставшиеся функции экспортируются по названию.</p>

        <br />

        <p>И еще один небольшой пример использования:</p>
        <CodeView>{EXAMPLE_2}</CodeView>
      </div>

      <p>В следующем разделе еще больше примеров...</p>

      <br />

      <Toolbar
        prev={{ link: "/docs/intro", title: "Введение" }}
        next={{ link: "/docs/examples", title: "Примеры" }}
      />
    </div>
  );
};

export default Install;
