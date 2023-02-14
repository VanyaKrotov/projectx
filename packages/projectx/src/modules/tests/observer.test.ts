import { describe, test, expect } from "@jest/globals";

import type { Event } from "../../shared";

import { Observer, ObserverWithType } from "../../components/observer";

test("Observer", async () => {
  const observer = new Observer<number>();
  const events: Event<number>[] = [];

  expect(events).toEqual([]);

  const unlisten = observer.listen((e) => {
    events.push(e);
  });

  expect(unlisten).not.toBeNull;
  expect(typeof unlisten).toBe("function");

  observer.emit({ current: 1, prev: 2 });
  observer.emit({ current: 2, prev: 3 });

  await Promise.resolve();

  expect(events.length).toBe(2);

  unlisten();

  observer.emit({ current: 3, prev: 4 });
  observer.emit({ current: 4, prev: 5 });

  await Promise.resolve();

  expect(events.length).toBe(2);
  expect(events).toEqual([
    { current: 1, prev: 2 },
    { current: 2, prev: 3 },
  ]);
});

describe("ObserverWithType<'change' | 'add'>", () => {
  const observer = new ObserverWithType<number, "change" | "add" | "all">();

  test("type 'change'", async () => {
    const events: Event<number>[] = [];

    expect(events.length).toBe(0);

    const unlisten = observer.listen("change", (e) => {
      events.push(e);
    });

    expect(typeof unlisten).toBe("function");

    observer.emit("change", { current: 1, prev: 0 });

    await Promise.resolve();

    expect(events.length).toBe(1);

    observer.emit("change", { current: 2, prev: 1 });

    // check equal values
    observer.emit("change", { current: 1, prev: 1 });

    unlisten();

    await Promise.resolve();

    expect(events.length).toBe(2);
    expect(events).toEqual([
      { current: 1, prev: 0 },
      { current: 2, prev: 1 },
    ]);
  });

  test("type 'add'", async () => {
    const events: Event<number>[] = [];

    expect(events.length).toBe(0);

    const unlisten = observer.listen("add", (e) => {
      events.push(e);
    });

    expect(typeof unlisten).toBe("function");

    observer.emit("add", { current: 3, prev: 2 });
    observer.emit("change", { current: 3 });

    await Promise.resolve();

    expect(events.length).toBe(1);

    observer.emit("add", { current: 4, prev: 3 });

    // check equal values
    observer.emit("add", { current: 1, prev: 1 });

    unlisten();

    observer.emit("add", { current: 5, prev: 4 });

    await Promise.resolve();

    expect(events.length).toBe(2);
    expect(events).toEqual([
      { current: 3, prev: 2 },
      { current: 4, prev: 3 },
    ]);
  });

  test("type 'all'", async () => {
    const events: Event<number>[] = [];

    expect(events.length).toBe(0);

    const unlisten = observer.listen("all", (e) => {
      events.push(e);
    });

    expect(typeof unlisten).toBe("function");

    observer.emit("add", { current: 3, prev: 2 });
    observer.emit("change", { current: 3 });

    await Promise.resolve();

    expect(events.length).toBe(2);

    observer.emit("add", { current: 4, prev: 3 });

    // check equal values
    observer.emit("change", { current: 1, prev: 1 });

    unlisten();

    observer.emit("change", { current: 5, prev: 4 });

    await Promise.resolve();

    expect(events.length).toBe(3);
    expect(events).toEqual([
      { current: 3, prev: 2 },
      { current: 3 },
      { current: 4, prev: 3 },
    ]);
  });
});
