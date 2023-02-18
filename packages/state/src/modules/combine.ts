import { CombineState } from "types";

import State from "./state";

function combine<T extends Record<string, State>>(
  states: T
): State<CombineState<T>> {
  return new (class extends State<CombineState<T>> {
    public state: CombineState<T>;
    private unlisten: VoidFunction[] = [];

    constructor() {
      super();

      const combined = {} as CombineState<T>;
      for (const key in states) {
        combined[key] = states[key].state;

        this.unlisten.push(states[key].listen(() => this.emit()));
      }

      this.state = combined;
    }

    public dispose() {
      this.unlisten.forEach((unlisten) => unlisten());
      super.dispose();
    }
  })();
}

export { combine };
