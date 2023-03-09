type Schema =
  | {
      [key: string | number]: Schema | Properties;
    }
  | Properties;

interface Observer {
  listen: (listener: () => void) => VoidFunction;
  emit: () => void;
  dispose: VoidFunction;
}
