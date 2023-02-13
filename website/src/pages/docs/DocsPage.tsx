import React from "react";
import { Nav, Sidenav } from "rsuite";

import Layout from "components/layout";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

const HomePage = () => {
  const { pathname } = useLocation();
  const subpage = pathname.replace("/docs", "");
  if (!subpage) {
    return <Navigate replace to="intro" />;
  }

  return (
    <Layout
      sidebar={
        <Sidenav appearance="subtle" defaultOpenKeys={["p.s", "p.s-r"]}>
          <Nav activeKey={subpage}>
            <Nav.Menu title={<b>projectx.store</b>} eventKey="p.s">
              <Nav.Item as={Link} eventKey="/intro" to="intro">
                Введение
              </Nav.Item>
              <Nav.Item eventKey="/install" as={Link} to="install">
                Устанока
              </Nav.Item>
              <Nav.Item eventKey="/started" as={Link} to="started">
                Начало работы
              </Nav.Item>
              <Nav.Item eventKey="/examples" as={Link} to="examples">
                Примеры
              </Nav.Item>
            </Nav.Menu>
            <Nav.Menu title={<b>projectx.store-react</b>} eventKey="p.s-r">
              <Nav.Item eventKey="p.s-r-1">Введение</Nav.Item>
              <Nav.Item eventKey="p.s-r-2">Устанока</Nav.Item>
              <Nav.Item eventKey="p.s-r-3">Начало работы</Nav.Item>
              <Nav.Item eventKey="p.s-r-4">Примеры</Nav.Item>
            </Nav.Menu>
            <Nav.Item>
              <b>Что-то еще?</b>
            </Nav.Item>
          </Nav>
        </Sidenav>
      }
    >
      <Routes>
        <Route path="intro" element={<div>1</div>} />
        <Route path="install" element={<div>2</div>} />
        <Route path="started" element={<div>3</div>} />
        <Route path="examples" element={<div>4</div>} />
      </Routes>
    </Layout>
  );
};

export default HomePage;
