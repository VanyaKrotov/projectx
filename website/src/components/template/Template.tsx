import React, { ReactNode, FC } from "react";

import { Header } from "./components";

import "./template.scss";

interface Props {
  children: ReactNode;
}

const Template: FC<Props> = ({ children }) => {
  return (
    <main>
      <Header />
      <article className="center-container">{children}</article>
    </main>
  );
};

export default Template;
