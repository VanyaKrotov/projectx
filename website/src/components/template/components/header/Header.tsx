import React from "react";
import {
  Navbar,
  Nav,
  IconButton,
  ButtonToolbar,
  Input,
  InputGroup,
} from "rsuite";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@rsuite/icons";
import SearchIcon from "@rsuite/icons/Search";

// @ts-ignore
import { repository } from "@/package.json";

import { viewState } from "entities/view";

import ThemeIcon from "assets/icons/theme-light-dark.svg";
import GitHubIcon from "assets/icons/github.svg";

import "./header.scss";

const Header = () => {
  const { pathname } = useLocation();

  return (
    <header>
      <Navbar className="center-container">
        <Navbar.Brand href="/" className="logo">
          ProjectX
        </Navbar.Brand>

        <Nav activeKey={pathname}>
          <Nav.Item as={Link} to="/docs" eventKey="docs">
            Документация
          </Nav.Item>
          <Nav.Item as={Link} to="/api" eventKey="api">
            Справочник API
          </Nav.Item>
          <Nav.Item as={Link} to="/examples" eventKey="examples">
            Примеры
          </Nav.Item>
          <Nav.Item as={Link} to="/release" eventKey="release">
            Релизы
          </Nav.Item>
        </Nav>

        <Nav pullRight className="right-container">
          <ButtonToolbar>
            <div className="search-container">
              <InputGroup>
                <Input placeholder="Поиск" />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </div>

            <IconButton
              icon={<Icon as={ThemeIcon} />}
              onClick={() => viewState.toggleTheme()}
              appearance="subtle"
              circle
              size="lg"
            />

            <IconButton
              as="a"
              href={repository.url}
              target="_blank"
              icon={<Icon as={GitHubIcon} />}
              circle
              appearance="subtle"
              size="lg"
            />
          </ButtonToolbar>
        </Nav>
      </Navbar>
    </header>
  );
};

export default Header;
