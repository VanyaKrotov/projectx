import { PathTree } from "../components/path-tree";
import type { ObserveStateInstance, CombineState } from "../shared/types";

import { ObserveState } from "./state";

function combine<T extends Record<string, ObserveStateInstance>>(
  states: T
): ObserveStateInstance<CombineState<T>> {
  return new (class extends ObserveState<CombineState<T>> {
    public data: CombineState<T>;
    private readonly unlisten: VoidFunction[] = [];

    constructor() {
      super();

      const combined = {} as CombineState<T>;
      for (const key in states) {
        const state = states[key] as ObserveStateInstance;

        combined[key] = state.data;

        this.unlisten.push(
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
      this.unlisten.forEach((unlisten) => unlisten());
      super.dispose();
    }
  })();
}

export { combine };
