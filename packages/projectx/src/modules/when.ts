import { createReaction } from "./reaction";

function when<T = boolean>(
  fn: () => T,
  resolveFn: (value: T) => boolean = (value) => Boolean(value)
): Promise<T> {
  return new Promise<T>((resolve) => {
    const reaction = createReaction(() => {
      handle(fn());
    });
    function handle(value: T) {
      if (!resolveFn(value)) {
        return;
      }

      resolve(value);
      reaction.dispose();
    }

    handle(reaction.syncCaptured(fn));
  });
}

export { when };
