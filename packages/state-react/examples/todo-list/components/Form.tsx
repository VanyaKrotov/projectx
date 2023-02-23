import React, { FC, useState } from "react";
import { connectWatch, useStateOrDefault } from "../../../src";

import { Todo, TodoState } from "../state";

const DEFAULT_TODO: Todo = {
  content: "",
  id: Date.now(),
  status: "in-progress",
  title: "",
};

const Form: FC<{ count: number }> = ({ count }) => {
  const state = useStateOrDefault<TodoState>();

  const [data, setData] = useState<Todo>(DEFAULT_TODO);

  return (
    <div>
      {count}
      <h4>Create todo</h4>
      <div>
        <label>
          <span>Title </span>
          <input
            value={data.title}
            onChange={(event) =>
              setData((p) => ({ ...p, title: event.target.value }))
            }
          />
        </label>
      </div>
      <p>
        <label>
          <span>Status </span>
          <select
            value={data.status}
            onChange={(event) =>
              setData((p) => ({ ...p, status: event.target.value as any }))
            }
          >
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
            <option value="canceled">canceled</option>
          </select>
        </label>
      </p>
      <div>
        <label>
          <p>Content</p>
          <textarea
            value={data.content}
            onChange={(event) =>
              setData((p) => ({ ...p, content: event.target.value }))
            }
          ></textarea>
        </label>
      </div>
      <div>
        <button
          onClick={() => {
            state.addTodo(data);
            setData(DEFAULT_TODO);
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            setData(DEFAULT_TODO);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default connectWatch<[Todo[]], { count: number }>(
  ["items"],
  ([items]) => ({
    count: items.length,
  })
)(Form);
