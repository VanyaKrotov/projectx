declare module "*.svg" {
  import * as React from "react";

  export default React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module "*.png" {
  const src: string;

  export default src;
}
