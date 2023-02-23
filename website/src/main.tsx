import React, { memo, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useWatch } from "projectx.state-react";

import { viewState } from "entities/view";

import Template from "components/template";

import DocsPage from "pages/docs";

import "rsuite/dist/rsuite.min.css";
import "./main.scss";

const Main = () => {
  const [loading] = useWatch<[boolean]>(["loading"]);

  useEffect(() => {
    viewState.loadData();
  }, []);

  return (
    <Template loading={loading}>
      <Routes>
        <Route path="docs/*" element={<DocsPage />} />
        <Route path="api/*" element={<div>api</div>} />
        <Route path="examples" element={<div>examples</div>} />

        <Route path="*" element={<Navigate to="/docs" />} />
      </Routes>
    </Template>
  );
};

export default memo(Main);
