import { describe, test, expect } from "@jest/globals";

import { createProvider } from "../create-provider";

describe("createProvider", () => {
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
    const provider = createProvider();

    provider.register(A);
    provider.register(B);

    const temp = {
      a: provider.injectSync(A),
      b: provider.injectSync(B),
    };

    expect(temp.a?.print()).toBe("A");
    expect(temp.b?.print()).toBe("B");
  });

  test("unregister", () => {
    const provider = createProvider();

    provider.register(A);
    provider.register(B);

    provider.unregister(B);

    const temp = {
      a: provider.injectSync(A),
      b: provider.injectSync(B),
    };

    expect(temp.a?.print()).toBe("A");
    expect(temp.b?.print()).toBeUndefined;
  });

  test("injectSync", () => {
    const provider = createProvider();

    provider.register(A);

    const temp = provider.injectSync(A);

    expect(temp?.print()).toBe("A");
  });

  test("injectAsync", () => {
    const provider = createProvider();

    class C {
      private a: A | null = null;

      constructor() {
        provider.injectAsync(A).then((a) => (this.a = a));
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
