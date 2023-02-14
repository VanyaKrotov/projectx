import React, { ReactNode, FC } from "react";

import { Header } from "./components";

import "./template.scss";

interface Props {
  children: ReactNode;
  loading: boolean;
}

const Template: FC<Props> = ({ children, loading }) => {
  return (
    <main>
      <Header />
      <article className="center-container">
        {loading ? <div>loading...</div> : children}
      </article>
    </main>
  );
};

export default Template;
