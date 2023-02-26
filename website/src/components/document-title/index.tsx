import React, { FC, ReactNode, useEffect } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

const DocumentTitle: FC<Props> = ({ title, children }) => {
  useEffect(() => {
    const savedTitle = document.title;

    document.title = `ProjectX | ${title}`;

    return () => {
      document.title = savedTitle;
    };
  }, [title]);

  return <>{children}</>;
};

export default DocumentTitle;
