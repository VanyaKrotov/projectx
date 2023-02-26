import { ArrowLeftLine, ArrowRightLine } from "@rsuite/icons";
import React, { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { FlexboxGrid, IconButton } from "rsuite";

interface Props {
  prev?: {
    link: string;
    title: string;
  };
  next?: {
    link: string;
    title: string;
  };
}

const Toolbar: FC<Props> = ({ prev, next }) => {
  const { search } = useLocation();

  return (
    <FlexboxGrid align="middle" justify="space-between">
      <FlexboxGrid.Item>
        {prev && (
          <IconButton
            as={Link}
            to={{ pathname: prev.link, search }}
            appearance="subtle"
            icon={<ArrowLeftLine />}
          >
            Назад. {prev.title}
          </IconButton>
        )}
      </FlexboxGrid.Item>
      <FlexboxGrid.Item>
        {next && (
          <IconButton
            as={Link}
            to={{ pathname: next.link, search }}
            appearance="subtle"
            placement="right"
            icon={<ArrowRightLine />}
          >
            Далее. {next.title}
          </IconButton>
        )}
      </FlexboxGrid.Item>
    </FlexboxGrid>
  );
};

export default Toolbar;
