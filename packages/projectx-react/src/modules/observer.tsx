import React, { FC, ComponentType, useEffect, useState, useRef } from "react";

// @ts-ignore
import { Reaction } from "projectx";

import { useForceUpdate } from "../shared/hooks";

function observer<P extends object>(Comp: ComponentType<P>): FC<P> {
  return (props: P) => {
    const ref = useRef<Reaction | null>(null);
    if (!ref.current) {
      ref.current = new Reaction(Comp.displayName);
    }

    const forceUpdate = useForceUpdate();

    ref.current.startWatch();

    useEffect(() => {
      ref.current!.watch(() => {
        forceUpdate();
      });

      ref.current!.endWatch();

      return () => {
        ref.current!.dispose();
        ref.current = null;
      };
    }, []);

    return <Comp {...props} />;
  };
}

export default observer;
