import React, { useEffect } from "react";
import { StateProvider, useLocalState } from "projectx.state-react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import Layout from "components/layout";
import DocumentTitle from "components/document-title";

import HomeState from "./shared/state";
import { createSearchParam } from "./shared/selectors";

import { Examples, Install, Intro } from "./components";
import { SideNav } from "./modules";

import "./styles.scss";

const HomePage = () => {
  const state = useLocalState(() => new HomeState());
  const { pathname } = useLocation();
  const [search] = useSearchParams();
  const version = search.get("version") || "0.1.0";
  const lib = search.get("lib") || "state";

  useEffect(() => {
    state.loadData(`${lib}.${version}`);
  }, [lib, version]);

  const section = pathname.replace(/^\/docs\/*/, "");
  if (!section) {
    return (
      <Navigate
        replace
        to={{ pathname: "intro", search: createSearchParam(lib, version) }}
      />
    );
  }

  console.log(state);

  return (
    <Layout sidebar={<SideNav lib={lib} section={section} version={version} />}>
      <StateProvider state={() => state}>
        <Routes>
          <Route
            path="intro"
            element={
              <DocumentTitle title={`Введение - ${lib}`}>
                <Intro section={section} />
              </DocumentTitle>
            }
          />
          <Route
            path="install"
            element={
              <DocumentTitle title={`Установка - ${lib}`}>
                <Install section={section} />
              </DocumentTitle>
            }
          />
          <Route
            path="examples"
            element={
              <DocumentTitle title={`Примеры - ${lib}`}>
                <Examples section={section} />
              </DocumentTitle>
            }
          />
        </Routes>
      </StateProvider>
    </Layout>
  );
};

export default HomePage;
