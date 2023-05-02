import { PathTree } from "../components/path-tree";

import { ObserveState } from "./state";

export type CombineState<T extends Record<string, ObserveState>> = {
  [P in keyof T]: T[P]["data"];
};

function combine<T extends Record<string, ObserveState>>(
  states: T
): ObserveState<CombineState<T>> {
  return new (class extends ObserveState<CombineState<T>> {
    public data: CombineState<T>;
    private readonly unsubscribe: VoidFunction[] = [];

    constructor() {
      super();

      const combined = {} as CombineState<T>;
      for (const key in states) {
        const state = states[key] as ObserveState;

        combined[key] = state.data;

        this.unsubscribe.push(
          state.listen((event) =>
            this.emit({
              detail: event.detail,
              changeTree: PathTree.pushPrefix(key, event.changeTree),
            })
          )
        );
      }

      this.data = combined;
    }

    public dispose() {
      this.unsubscribe.forEach((callback) => callback());
      super.dispose();
    }
  })();
}

export { combine };
