import { Provider } from "../../packages/di";

const provider = new Provider();

class AccountService {
  getData() {
    return "data";
  }
}

provider.register(AccountService);

class Account {
  constructor(private service = provider.inject(AccountService)) {}

  print() {
    console.log(this.service);
    console.log(this.service?.getData());
  }
}

const account = new Account();

account.print();
