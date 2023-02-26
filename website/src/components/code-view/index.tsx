import React, { FC } from "react";
import { useWatch } from "projectx.state-react";

import { Prism } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { viewState } from "entities/view";
import { Themes } from "entities/view/types";

interface Props {
  children: string;
  language?: "typescript" | "http";
}

const CodeView: FC<Props> = ({ children, language = "typescript" }) => {
  const [theme] = useWatch<[Themes]>(["theme"], viewState);
  const style = theme === "dark" ? oneDark : oneLight;

  return (
    <Prism language={language} style={style}>
      {children}
    </Prism>
  );
};

export default CodeView;
