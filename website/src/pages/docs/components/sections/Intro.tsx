import React, { FC } from "react";

import { DocSection } from "entities/view/types";

interface Props {
  data: DocSection;
}

const Intro: FC<Props> = () => {
  return (
    <div>
      <h2>Введение в projectx.store</h2>
    </div>
  );
};

export default Intro;
