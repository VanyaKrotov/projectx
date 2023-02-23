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

import { Examples, Install, Intro, Started } from "./components";
import { SideNav } from "./modules";

const HomePage = () => {
  const state = useLocalState(() => new HomeState());
  const { pathname } = useLocation();
  const [search] = useSearchParams();
  const version = search.get("version") || "0.1.0";
  const lib = search.get("lib") || "store";

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

  return (
    <Layout sidebar={<SideNav lib={lib} section={section} version={version} />}>
      <StateProvider state={() => state}>
        <Routes>
          <Route path="intro" element={<Intro section={section} />} />
          <Route path="install" element={<Install section={section} />} />
          <Route path="started" element={<Started section={section} />} />
          <Route path="examples" element={<Examples section={section} />} />
        </Routes>
      </StateProvider>
    </Layout>
  );
};

export default HomePage;
