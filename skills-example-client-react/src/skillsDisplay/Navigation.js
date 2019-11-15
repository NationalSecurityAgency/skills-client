import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from "react-bootstrap/Nav";
// import { SkillsLevel } from '@skills/skills-client-vue';

const Navigation = (props) => {
  // const projectId = 'movies';
  const reportSkillEvent = () => {
    alert('Click!');
  };

  return (
    <div>
      <Navbar bg="info" variant="dark">
        <Navbar.Brand href="#">React Integration Examples</Navbar.Brand>
        <Navbar.Toggle target="nav-collapse"></Navbar.Toggle>
        <Navbar.Collapse id="nav-collapse" is-nav>
          <Nav>
            <Nav.Link href="#" onClick={reportSkillEvent}>Report Skill Events</Nav.Link>
            <Nav.Link href="#">User Display</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        {/*<SkillsLevel projectId={projectId}/>*/}
      </Navbar>
    </div>
  );
};

export default Navigation;