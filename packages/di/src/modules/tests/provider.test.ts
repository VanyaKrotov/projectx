import { describe, test, expect } from "@jest/globals";

import { Provider } from "../provider";

describe("Provider", () => {
  class A {
    print() {
      return "A";
    }
  }

  class B {
    print() {
      return "B";
    }
  }

  test("register", () => {
    const provider = new Provider();

    provider.register(A);
    provider.register(B);

    const temp = {
      a: provider.inject(A),
      b: provider.inject(B),
    };

    expect(temp.a?.print()).toBe("A");
    expect(temp.b?.print()).toBe("B");
  });

  test("unregister", () => {
    const provider = new Provider();

    provider.register(A);
    provider.register(B);

    provider.unregister(B);

    const temp = {
      a: provider.inject(A),
      b: provider.inject(B),
    };

    expect(temp.a?.print()).toBe("A");
    expect(temp.b?.print()).toBeUndefined;
  });

  test("inject", () => {
    const provider = new Provider();

    provider.register(A);

    const temp = provider.inject(A);

    expect(temp?.print()).toBe("A");
  });

  test("injectAsync", () => {
    const provider = new Provider();

    class C {
      private a: A | null = null;

      constructor() {
        provider.injectAfterCreate(A).then((a) => (this.a = a));
      }

      print() {
        return this.a?.print();
      }
    }

    const c = new C();

    provider.register(A);

    //
    setTimeout(() => {
      expect(c.print()).toBe("A");
    });
  });
});
