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

import HomeState from "./shared/state";
import { createSearchParam } from "./shared/selectors";

import { Section } from "./components";
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

  const currentSectionPath = state.data.data?.sections[section].path;

  return (
    <Layout sidebar={<SideNav lib={lib} section={section} version={version} />}>
      <StateProvider state={() => state}>
        <Routes>
          <Route
            path="intro"
            element={
              <Section
                path={currentSectionPath}
                title={`Введение - ${lib}`}
                toolbarProps={{
                  next: { link: "/docs/install", title: "Установка" },
                }}
              />
            }
          />
          <Route
            path="install"
            element={
              <Section
                path={currentSectionPath}
                title={`Установка - ${lib}`}
                toolbarProps={{
                  next: { link: "/docs/examples", title: "Примеры" },
                  prev: { link: "/docs/intro", title: "Введение" },
                }}
              />
            }
          />
          <Route
            path="examples"
            element={
              <Section
                path={currentSectionPath}
                title={`Примеры - ${lib}`}
                toolbarProps={{
                  prev: { link: "/docs/install", title: "Установка" },
                }}
              />
            }
          />
        </Routes>
      </StateProvider>
    </Layout>
  );
};

export default HomePage;
