import React, { FC, useEffect, useRef } from "react";
import { connect, Observe } from "../../src";

import { TodoState, TodoStateData } from "./state";

import Form from "./components/Form";
import Todo from "./components/Todo";

const state = new TodoState();

const selectItems = (state: TodoStateData) => state.items;
const selectLoading = (state: TodoStateData) => state.loading;
const selectError = (state: TodoStateData) => state.error;

const FormConnect = connect(state, (state) => ({ state: state }))(Form);

const TodoList: FC = () => {
  const ref = useRef();
  console.log("render[TodoList]");

  useEffect(() => {
    console.log(ref);
    state.fetchData();
  }, []);

  return (
    <div>
      <div>
        <Observe state={state} selector={selectLoading}>
          {({ data }) =>
            data ? (
              <div>
                <div>Loading items...</div>
              </div>
            ) : (
              <>
                <Observe state={state} selector={selectError}>
                  {({ data }) =>
                    data ? (
                      <div>
                        <span>Error load todo items. </span>
                        <span>{data}</span>
                        <button onClick={() => state.fetchData()}>
                          reload items
                        </button>
                      </div>
                    ) : null
                  }
                </Observe>
                <Observe state={state} selector={selectItems}>
                  {({ data }) => (
                    <>
                      {data.map((todo) => (
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
                </Observe>
              </>
            )
          }
        </Observe>
      </div>
      <FormConnect />
    </div>
  );
};

export default TodoList;
