import React, { FC, useEffect } from "react";
import { WatchObserve, StateProvider } from "../../src";

import { Todo as TodoModal, TodoState } from "./state";

import Form from "./components/Form";
import Todo from "./components/Todo";

const state = new TodoState();

const TodoList: FC = () => {
  useEffect(() => {
    state.fetchData();
  }, []);

  return (
    <StateProvider state={() => state}>
      <div>
        <WatchObserve<[boolean]> watch={["loading"]}>
          {({ data: [loading] }) =>
            loading ? (
              <div>
                <div>Loading items...</div>
              </div>
            ) : (
              <>
                <WatchObserve<[boolean]> watch={["error"]}>
                  {({ data: [error] }) =>
                    error ? (
                      <div>
                        <span>Error load todo items. </span>
                        <span>{error}</span>
                        <button onClick={() => state.fetchData()}>
                          reload items
                        </button>
                      </div>
                    ) : null
                  }
                </WatchObserve>
                <WatchObserve<[TodoModal[]]> watch={["items"]}>
                  {({ data: [items] }) => (
                    <>
                      {items.map((todo) => (
                        <Todo
                          {...todo}
                          key={todo.id}
                          onRemove={() => state.removeById(todo.id)}
                          onChangeStatus={(status) =>
                            state.changeStatus(todo.id, status)
                          }
                        />
                      ))}
                    </>
                  )}
                </WatchObserve>
              </>
            )
          }
        </WatchObserve>
      </div>
      <Form />
    </StateProvider>
  );
};

export default TodoList;
