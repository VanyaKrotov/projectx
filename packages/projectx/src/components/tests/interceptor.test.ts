import { test, expect } from "@jest/globals";
import { createInterceptor } from "../interceptor";
import { createObserver } from "../observer";

test("Interceptor", () => {
  const interceptor = createInterceptor();
  const observer = createObserver();
  const events: string[] = [];

  expect(events.length).toBe(0);

  const listener = () => {
    events.push("event");
  };

  const unregister = interceptor.register(listener);

  interceptor.handler(observer);
  interceptor.handler(observer);

  unregister();

  interceptor.handler(observer);

  expect(events.length).toBe(2);
  expect(events).toEqual(["event", "event"]);
});
