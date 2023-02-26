import State, { batch, combine } from "projectx.state";

class DataState extends State<{ data: string }> {
  public readonly data = {
    data: "test data",
  };

  public updateData(data: string) {
    this.change({ data });
  }
}

class AccountState extends State<{ auth: boolean }> {
  public readonly data = {
    auth: false,
  };

  public login() {
    this.change({ auth: true });
  }

  public logout() {
    this.change({ auth: false });
  }
}

const data = new DataState();
const account = new AccountState();

const state = combine({
  data,
  account,
});

state.watch(["account.auth"], () => {
  console.log("auth: ", state.data.account.auth);
});
