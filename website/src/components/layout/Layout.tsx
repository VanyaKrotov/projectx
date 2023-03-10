import React, { FC, ReactNode } from "react";
import { Affix } from "rsuite";

import "./layout.scss";

interface Props {
  children: ReactNode;
  sidebar: ReactNode;
}

const Layout: FC<Props> = ({ children, sidebar }) => {
  return (
    <div className="layout-container">
      <Affix top={60}>
        <div>{sidebar}</div>
      </Affix>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
