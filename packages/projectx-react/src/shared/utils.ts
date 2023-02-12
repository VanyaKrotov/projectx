import { ComponentType } from "react";

export function getComponentName<P>(Comp: ComponentType<P>): string {
  return Comp.displayName || Comp.name || Comp.constructor.name || typeof Comp;
}
