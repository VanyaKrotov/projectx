import State from "./state";

function combine<T extends Record<string, StateInstance>>(
  states: T
): StateInstance<CombineState<T>> {
  return new (class extends State<CombineState<T>> {
    public data: CombineState<T>;
    private unlisten: VoidFunction[] = [];

    constructor() {
      super();

      const combined = {} as CombineState<T>;
      for (const key in states) {
        const stateInstance = states[key] as unknown as State;

        combined[key] = stateInstance.data;
        this.unlisten.push(
          stateInstance.listen((event) =>
            this.emit({
              [key]: event,
            })
          )
        );
      }

      this.data = combined;
    }

    public dispose() {
      this.unlisten.forEach((unlisten) => unlisten());
      super.dispose();
    }
  })();
}

export { combine };
