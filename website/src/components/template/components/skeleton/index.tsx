import React from "react";
import { Nav, Sidenav, Placeholder } from "rsuite";

import Layout from "components/layout";

const Section = () => (
  <Nav.Menu
    title={<Placeholder.Graph height={10} width={170} active />}
    eventKey={"1"}
  >
    <Nav.Item>
      <Placeholder.Graph height={10} width={150} active />
    </Nav.Item>
    <Nav.Item>
      <Placeholder.Graph height={10} width={130} active />
    </Nav.Item>
    <Nav.Item>
      <Placeholder.Graph height={10} width={140} active />
    </Nav.Item>
    <Nav.Item>
      <Placeholder.Graph height={10} width={120} active />
    </Nav.Item>
  </Nav.Menu>
);

const Skeleton = () => {
  return (
    <Layout
      sidebar={
        <Sidenav appearance="subtle" defaultOpenKeys={["1"]}>
          <Nav>
            <Section />

            <Section />

            <Section />

            <Nav.Item>
              <Placeholder.Graph height={10} width={170} />
            </Nav.Item>
          </Nav>
        </Sidenav>
      }
    >
      <div>
      </div>
    </Layout>
  );
};

export default Skeleton;
