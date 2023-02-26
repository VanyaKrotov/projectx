import State from "projectx.state";

class CounterState extends State<{ counter: number }> {
  public readonly data = {
    counter: 0,
  };
}
