import { describe, test, expect } from "@jest/globals";

import { ObserverEvent } from "../../shared/types";
import { Observer } from "../observer";
import { PathTree } from "../path-tree";

describe("Observer", () => {
  test("default", () => {
    const events: ObserverEvent[] = [];
    const observer = new (class extends Observer<object> {})();

    const unlisten = observer.listen((event) => {
      events.push(event);
    });

    expect(typeof unlisten).toBe("function");

    const event1 = { changeTree: new PathTree(["counter"]), detail: {} };
    const event2 = { changeTree: new PathTree(["test"]), detail: {} };
    const event3 = { changeTree: new PathTree(), detail: {} };

    expect(events.length).toBe(0);

    observer.emit(event1);
    observer.emit(event2);

    unlisten();

    observer.emit(event3);

    expect(events.length).toBe(2);
    expect(events).toEqual([event1, event2]);
  });

  test("stop event", () => {
    const events1: ObserverEvent[] = [];
    const events2: ObserverEvent[] = [];
    const observer = new (class extends Observer<object> {})();

    const unlisten1 = observer.listen((event) => {
      events1.push(event);

      return events1.length > 1;
    });

    const unlisten2 = observer.listen((event) => {
      events2.push(event);
    });

    expect(typeof unlisten1).toBe("function");
    expect(typeof unlisten2).toBe("function");

    const event1 = { changeTree: new PathTree(["counter"]), detail: {} };
    const event2 = {
      changeTree: new PathTree(["test", "counter"]),
      detail: {},
    };
    const event3 = { changeTree: new PathTree(), detail: {} };

    expect(events1.length).toBe(0);
    expect(events2.length).toBe(0);

    observer.emit(event1);
    observer.emit(event2);

    unlisten1();
    unlisten2();

    observer.emit(event3);

    expect(events1.length).toBe(2);
    expect(events2.length).toBe(1);
    expect(events1).toEqual([event1, event2]);
    expect(events2).toEqual([event1]);
  });
});