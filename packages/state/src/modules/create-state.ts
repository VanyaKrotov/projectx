import State from "./state";

type JoinDefaultState<T> = {
  state: unknown;
} & { [P in keyof T]: T[P] };

function createState<
  T extends JoinDefaultState<T>,
  S extends object = T["state"]
>(initialize: T) {
  return Object.assign(
    new (class extends State<S> {
      public state = initialize.state;
    })(),
    initialize
  );
}

export default createState;
