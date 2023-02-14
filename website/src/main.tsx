import React, { useEffect } from "react";
import { CustomProvider } from "rsuite";
import { observer } from "projectx.store-react";
import { Route, Routes, Navigate } from "react-router-dom";

import { viewStore } from "entities/view";

import Template from "components/template";

import DocsPage from "pages/docs";

import "rsuite/dist/rsuite.min.css";
import "./main.scss";

const Main = () => {
  useEffect(() => {
    viewStore.loadData();
  }, []);

  return (
    <CustomProvider theme={viewStore.theme}>
      <Template loading={viewStore.loading}>
        <Routes>
          <Route path="docs/*" element={<DocsPage />} />
          <Route path="api/*" element={<div>api</div>} />
          <Route path="examples" element={<div>examples</div>} />

          <Route path="*" element={<Navigate to="/docs" />} />
        </Routes>
      </Template>
    </CustomProvider>
  );
};

export default observer(Main);
