import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import Main from "./main";

const root = createRoot(document.getElementById("root")!);

root.render(
  <HashRouter>
    <Main />
  </HashRouter>
);
