import { test, expect } from "@jest/globals";
import Interceptor from "../interceptor";

test("Interceptor", () => {
  const interceptor = new Interceptor();
  const events: string[] = [];

  expect(events.length).toBe(0);

  const listener = () => {
    events.push("event");
  };

  interceptor.register(listener);

  interceptor.emit({ path: [] });
  interceptor.emit({ path: [] });

  interceptor.unregister(listener);

  interceptor.emit({ path: [] });

  expect(events.length).toBe(2);
  expect(events).toEqual(["event", "event"]);
});
