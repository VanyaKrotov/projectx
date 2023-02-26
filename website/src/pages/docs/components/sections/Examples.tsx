import React, { FC } from "react";

import Toolbar from "../toolbar";

interface Props {
  section: string;
}

const Examples: FC<Props> = () => {
  return (
    <div className="section">
      <h1>Примеров много не бывает</h1>

      <br />

      <Toolbar prev={{ link: "/docs/install", title: "Установка" }} />
    </div>
  );
};

export default Examples;
