import { Reaction } from "./reaction";

function when<T = boolean>(
  fn: () => T,
  resolveFn: (value: T) => boolean = (value) => Boolean(value)
): Promise<T> {
  const reaction = new Reaction();

  return new Promise<T>((res) => {
    const result = reaction.syncCaptured(fn);

    const handle = (value: T) => {
      if (!resolveFn(value)) {
        return;
      }

      res(value);

      reaction.dispose();
    };

    reaction.watch(() => {
      handle(fn());
    });

    handle(result);
  });
}

export { when };
