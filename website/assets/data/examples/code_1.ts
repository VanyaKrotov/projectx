class CounterState extends State<{ counter: number }> {
  public readonly data = {
    counter: 0,
  };

  public increment() {
    this.change({ counter: this.data.counter + 1 });
  }

  public decrement() {
    this.change({ counter: this.data.counter - 1 });
  }
}

const counterState = new CounterState();

counterState.watch(["counter"], () => {
  console.log("counter: ", counterState.data.counter);
});

setTimeout(() => {
  counterState.increment();
}, 1000);
