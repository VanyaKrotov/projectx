import { createProvider } from "../../packages/projectx.di";

const provider = createProvider();

class AccountService {
  getData() {
    return "data";
  }
}

provider.register({
  instance: new AccountService(),
  target: "account-service",
});

class Account {
  constructor(
    private service = provider.injectSync<AccountService>("account-service")
  ) {}

  print() {
    console.log(this.service);
    console.log(this.service?.getData());
  }
}

const account = new Account();

setTimeout(() => {
  // Имитация клика
  account.print();
}, 10);
