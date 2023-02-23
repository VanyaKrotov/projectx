import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Nav, Sidenav } from "rsuite";
import { useWatch } from "projectx.state-react";

import { ViewData } from "entities/view/types";
import { SECTIONS } from "pages/docs/shared/constants";
import { createSearchParam } from "pages/docs/shared/selectors";

interface Props {
  lib: string;
  section: string;
  version: string;
}

const SideNav: FC<Props> = ({ lib, section, version }) => {
  const [data] = useWatch<[ViewData]>(["data"]);

  return (
    <Sidenav appearance="subtle" defaultOpenKeys={Object.keys(data.packages)}>
      <Nav activeKey={`${lib}-${section}`}>
        {Object.entries(data.packages).map(([libname]) => (
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
  );
};

export default SideNav;
