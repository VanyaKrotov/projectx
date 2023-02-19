import React, { FC } from "react";

import { Todo as TodoModel } from "../state";

interface Props extends TodoModel {
  onChangeStatus(status: TodoModel["status"]): void;
  onRemove(): void;
}

const Todo: FC<Props> = ({
  content,
  status,
  title,
  onChangeStatus,
  onRemove,
}) => {
  return (
    <div
      style={{
        margin: 10,
        padding: 10,
        borderRadius: 4,
        width: 400,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button onClick={onRemove}>X</button>
          <span style={{ margin: 4, fontSize: 18, fontWeight: "bold" }}>
            {title}
          </span>
        </div>
        <div>
          <button
            onClick={() => onChangeStatus("done")}
            style={{ backgroundColor: status === "done" ? "greenyellow" : "" }}
          >
            done
          </button>
          <button
            onClick={() => onChangeStatus("in-progress")}
            style={{
              backgroundColor: status === "in-progress" ? "silver" : "",
            }}
          >
            in-progress
          </button>
          <button
            onClick={() => onChangeStatus("canceled")}
            style={{ backgroundColor: status === "canceled" ? "tomato" : "" }}
          >
            canceled
          </button>
        </div>
      </div>
      <p>{content}</p>
    </div>
  );
};

export default Todo;
