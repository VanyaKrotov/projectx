import React, { FC, useEffect, useState } from "react";
import { FlexboxGrid } from "rsuite";

import { loadContent, storage } from "./shared";

interface Props {
  path?: string;
}

const PageViewer: FC<Props> = ({ path }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!path) {
      return;
    }

    const data = storage.get(path);
    if (data) {
      return setContent(data);
    }

    loadContent(path).then((cont) => {
      setContent(cont);
      storage.set(path, cont);
    });
  }, [path]);

  return (
    <div className="section">
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      ) : (
        <FlexboxGrid align="middle" justify="center" style={{ height: "100%" }}>
          <FlexboxGrid.Item>Loading...</FlexboxGrid.Item>
        </FlexboxGrid>
      )}
    </div>
  );
};

export default PageViewer;
