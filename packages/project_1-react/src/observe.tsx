import { memo, useEffect } from "react";
import { useForceUpdate } from "./hooks";
import { Admin } from "./types";

import { getStorex, isEqualArray } from "./utils";

const { batchManager } = getStorex();

class ObserverManager {
  private variables: string[][] = [];
  private admins: Admin[] = [];

  private paths: string[][] = [];

  private listener({ path }: { path: string[] }) {
    this.paths.push(path);
  }

  public register() {
    this.paths = [];
    batchManager.register(this.listener.bind(this));
  }

  public unregister() {
    batchManager.unregister(this.listener);
  }

  public getCapturedAdmins() {
    if (!isEqualArray(this.paths, this.variables)) {
      console.log("memo");
      this.variables = this.paths;
      this.admins = batchManager
        .optimizePaths(this.variables)
        .optimizedAdmins();
    }

    return this.admins;
  }
}

function observe<P extends object, T extends React.ComponentType<P>>(Comp: T) {
  const manager = new ObserverManager();

  return memo((props: P) => {
    const forceUpdate = useForceUpdate();

    manager.register();

    useEffect(() => {
      manager.unregister();

      const admins = manager.getCapturedAdmins();

      console.log(admins);
      const unsubscribeFunctions = admins.map((admin) =>
        admin.listen(({ prev, current }) => {
          if (prev === current) {
            return;
          }

          forceUpdate();
        })
      );

      return () => {
        unsubscribeFunctions.forEach((uns) => uns());
      };
    }, []);

    // @ts-ignore
    return <Comp {...props} />;
  });
}

export default observe;
