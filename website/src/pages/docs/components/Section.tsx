import React, { FC, useEffect } from "react";

import DocumentTitle from "components/document-title";
import PageViewer from "components/page-viewer";

import Toolbar, { ToolbarProps } from "./toolbar";

interface Props {
  title: string;
  path?: string;
  toolbarProps: ToolbarProps;
}

const Section: FC<Props> = ({ path, title, toolbarProps }) => {
  useEffect(() => {
    window.scroll({ top: 0, behavior: "smooth" });
  }, [title]);

  return (
    <DocumentTitle title={title}>
      <PageViewer path={path} />
      <br />
      <Toolbar {...toolbarProps} />
    </DocumentTitle>
  );
};

export default Section;
