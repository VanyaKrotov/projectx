import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import TodoList from "./todo-list";

const App: FC = () => {
  console.log("render[App]");

  return (
    <div>
      <h1>Examples</h1>
      <div>
        <h2>Todo list</h2>
        <TodoList />
      </div>
    </div>
  );
};

const root = document.getElementById("root")!;

createRoot(root).render(<App />);
