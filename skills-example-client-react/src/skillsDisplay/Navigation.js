import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button"
import { SkillsLevel } from '@skills/skills-client-react';
// import SkillsLevel from "./SkillsLevel";
// import SkillsLevel from "@skills/skills-client-react/src/component/SkillsLevel"

const Navigation = (props) => {
  const projectId = props.projectId;
  const reportSkillEvent = () => {
    alert('Clicked!');
  };

  return (
    <div>
      <Navbar bg="info" variant="dark">
        <Navbar.Brand href="#">React Integration Examples</Navbar.Brand>
        <Navbar.Toggle target="nav-collapse"></Navbar.Toggle>
        <Navbar.Collapse id="nav-collapse">
          <Nav>
            <Nav.Link href="#" onClick={reportSkillEvent}>Report Skill Events</Nav.Link>
            <Nav.Link href="#">User Display</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Button variant="primary">
          <SkillsLevel projectId={projectId}/>
        </Button>
      </Navbar>
    </div>
  );
};

export default Navigation;