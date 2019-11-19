import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button"
import { SkillsLevel } from '@skills/skills-client-react';

import {
  NavLink
} from "react-router-dom";
// import { SkillsLevel } from '@skills/skills-client-vue';

const Navigation = (props) => {
  const projectId = props.projectId;

  return (
    <div>
      <Navbar bg="info" variant="dark">
        <Navbar.Brand>React Integration Examples</Navbar.Brand>
        <Navbar.Toggle target="nav-collapse"></Navbar.Toggle>
        <Navbar.Collapse id="nav-collapse" is-nav="true">
          <Nav>
            <NavLink activeClassName="router-link-active" className="nav-link" to="/">Report Skill Events</NavLink>
            {/*<Nav.Link href="#" onClick={reportSkillEvent}>Report Skill Events</Nav.Link>*/}
            <NavLink activeClassName="router-link-active" className="nav-link" to="/showSkills">User Display</NavLink>
            {/*<Nav.Link href="#">User Display</Nav.Link>*/}
          </Nav>
        </Navbar.Collapse>
          <Button variant="primary">
              <SkillsLevel projectId={projectId}/>
          </Button>
        {/*<SkillsLevel projectId={projectId}/>*/}
      </Navbar>
    </div>
  );
};

export default Navigation;