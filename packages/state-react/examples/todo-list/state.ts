import State from "projectx.state";
export interface Todo {
  id: number;
  title: string;
  content: string;
  status: "in-progress" | "done" | "canceled";
}

export interface TodoStateData {
  loading: boolean;
  items: Todo[];
  error: string | null;
}

const mock: Todo[] = [
  {
    id: 1,
    title: "First todo",
    content: "Content 1",
    status: "in-progress",
  },
  {
    id: 2,
    title: "Second todo",
    content: "Content 2",
    status: "in-progress",
  },
  {
    id: 3,
    title: "Todo done",
    content: "Content 3",
    status: "done",
  },
];

class TodoState extends State<TodoStateData> {
  public data: TodoStateData = {
    items: [],
    loading: true,
    error: null,
  };

  public async fetchData() {
    this.change({
      error: null,
      loading: true,
    });

    try {
      const data = await new Promise<Todo[]>((resolve, reject) =>
        setTimeout(() => {
          if (!(Date.now() % 10)) {
            reject(new Error("Error load data!"));
          } else {
            resolve(mock);
          }
        }, 2000)
      );

      this.change({ items: data, loading: false });
    } catch (error) {
      this.change({ error: (error as Error).message, loading: false });
    }
  }

  public addTodo(todo: Todo) {
    this.change({ items: this.data.items.concat(todo) });
  }

  public removeById(id: number) {
    const index = this.data.items.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return;
    }

    this.data.items.splice(index, 1);

    this.change({ items: this.data.items });
  }

  public changeStatus(id: number, status: Todo["status"]) {
    const index = this.data.items.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return;
    }

    this.commit([{ path: `items.${index}.status`, value: status }]);
  }
}

class CounterState extends State<{ counter: number }> {
  public data: { counter: number } = {
    counter: 0,
  };
}

export { TodoState, CounterState };
