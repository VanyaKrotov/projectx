import { Reaction } from "./reaction";

function when<T = boolean>(
  fn: () => T,
  resolveFn: (value: T) => boolean = (value) => Boolean(value)
): Promise<T> {
  const reaction = new Reaction("When");

  return new Promise<T>((resolve) => {
    const handle = (value: T) => {
      if (!resolveFn(value)) {
        return;
      }

      resolve(value);
      reaction.dispose();
    };

    reaction.setReactionCallback(() => {
      handle(fn());
    });

    handle(reaction.syncCaptured(fn));
  });
}

export { when };
