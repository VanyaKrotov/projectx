import React, { useEffect } from "react";
import { Nav, Sidenav } from "rsuite";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { observer, useLocalObservable } from "projectx.store-react";

import { viewStore } from "entities/view";

import Layout from "components/layout";

import { SECTIONS } from "./shared/constants";
import HomePageState from "./shared/state";
import { createSearchParam } from "./shared/selectors";

import { Examples, Install, Intro, Started } from "./components";

const HomePage = () => {
  const store = useLocalObservable(() => new HomePageState());
  const { pathname } = useLocation();
  const [search] = useSearchParams();
  const version = search.get("version") || "0.1.0";
  const lib = search.get("lib") || "store";

  useEffect(() => {
    store.loadData(`${lib}.${version}`);
  }, [lib, version]);

  const section: string = pathname.replace(/^\/docs\/*/, "");
  if (!section) {
    return (
      <Navigate
        replace
        to={{ pathname: "intro", search: createSearchParam(lib, version) }}
      />
    );
  }

  const loading = store.loading;
  if (loading) {
    return <div>loading...</div>;
  }

  if (store.error || !store.data) {
    return <div>error</div>;
  }

  const sectionData = store.data.sections[section];
  console.log(sectionData);
  console.log(lib);

  return (
    <Layout
      sidebar={
        <Sidenav
          appearance="subtle"
          defaultOpenKeys={Object.keys(viewStore.data!.packages)}
        >
          <Nav activeKey={`${lib}-${section}`}>
            {Object.entries(viewStore.data!.packages).map(([libname]) => (
              <Nav.Menu
                title={<b>projectx.{libname}</b>}
                eventKey={libname}
                key={libname}
              >
                {SECTIONS.map(({ eventKey, pathname, title }) => {
                  const key = `${libname}-${eventKey}`;

                  return (
                    <Nav.Item
                      as={Link}
                      key={key}
                      eventKey={key}
                      to={{
                        pathname,
                        search: createSearchParam(libname, version),
                      }}
                    >
                      {title}
                    </Nav.Item>
                  );
                })}
              </Nav.Menu>
            ))}

            <Nav.Item>
              <b>Что-то еще?</b>
            </Nav.Item>
          </Nav>
        </Sidenav>
      }
    >
      <Routes>
        <Route path="intro" element={<Intro data={sectionData} />} />
        <Route path="install" element={<Install data={sectionData} />} />
        <Route path="started" element={<Started data={sectionData} />} />
        <Route path="examples" element={<Examples data={sectionData} />} />
      </Routes>
    </Layout>
  );
};

export default observer(HomePage);
