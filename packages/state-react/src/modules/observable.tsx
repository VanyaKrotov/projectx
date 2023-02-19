import React, { useEffect, useState } from "react";

import type { ObserveProps } from "../shared/types";

function Observe<S extends object, R>({
  state,
  selector,
  children: Comp,
}: ObserveProps<S, R>) {
  const [data, setData] = useState(selector(state.data));

  useEffect(() => state.reaction([selector], setData), [selector]);

  return <Comp data={data} />;
}

export { Observe };
