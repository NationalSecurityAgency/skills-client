/*
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button"
import { SkillsLevel } from '@skilltree/skills-client-react';

import {
  NavLink
} from "react-router-dom";

const Navigation = () => {

  const tmpStyle = {
    position:'fixed',
    zIndex:1100,
    right:0,
    left:0,
  };

  return (
    <div style={tmpStyle}>
      <Navbar bg="info" variant="dark">
        <Navbar.Brand>React v18 Integration Examples</Navbar.Brand>
        <Navbar.Toggle target="nav-collapse"></Navbar.Toggle>
        <Navbar.Collapse id="nav-collapse" is-nav="true">
          <Nav>
            <NavLink data-cy="reportSkillsLink" className={({ isActive }) => "nav-link" + (isActive ? " activated" : "")} to="/">Report Skill Events</NavLink>
            <NavLink data-cy="skillsDisplayLink" className={({ isActive }) => "nav-link" + (isActive ? " activated" : "")} to="/showSkills?isSummaryOnly=false&internalBackButton=false&themeName=Bright%20(default)&skillsVersion=">User Display</NavLink>
          </Nav>
        </Navbar.Collapse>
          <Button variant="primary">
              <SkillsLevel />
          </Button>
      </Navbar>
    </div>
  );
};

export default Navigation;
