import React from "react";
import { CustomProvider } from "rsuite";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { StateProvider, WatchObserve } from "projectx.state-react";

import { viewState } from "entities/view";

import Main from "./main";
import { Themes } from "entities/view/types";

const root = createRoot(document.getElementById("root")!);

root.render(
  <HashRouter>
    <StateProvider state={() => viewState}>
      <WatchObserve<[Themes]> watch={["theme"]}>
        {({ data: [theme] }) => (
          <CustomProvider theme={theme}>
            <Main />
          </CustomProvider>
        )}
      </WatchObserve>
    </StateProvider>
  </HashRouter>
);
