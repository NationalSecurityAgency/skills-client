import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button"
import { SkillsLevel } from '@skills/skills-client-react';
// import SkillsLevel from "./SkillsLevel";
// import SkillsLevel from "@skills/skills-client-react/src/component/SkillsLevel"

import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ShowSkills from './ShowSkills'
// import { SkillsLevel } from '@skills/skills-client-vue';

const Navigation = (props) => {
  const projectId = props.projectId;
  const reportSkillEvent = () => {
    alert('Clicked!');
  };

  return (
      <Router>
        <div>
          <Navbar bg="info" variant="dark">
            <Navbar.Brand href="#">React Integration Examples</Navbar.Brand>
            <Navbar.Toggle target="nav-collapse"></Navbar.Toggle>
            <Navbar.Collapse id="nav-collapse" is-nav="true">
              <Nav>
                <Link to="/reportSkillEvent">Report Skill Events</Link>
                {/*<Nav.Link href="#" onClick={reportSkillEvent}>Report Skill Events</Nav.Link>*/}
                <Link to="/showSkills">User Display</Link>
                {/*<Nav.Link href="#">User Display</Nav.Link>*/}
              </Nav>
            </Navbar.Collapse>
              <Button variant="primary">
                  <SkillsLevel projectId={projectId}/>
              </Button>
            {/*<SkillsLevel projectId={projectId}/>*/}
          </Navbar>
        </div>
        <Switch>
          <Route exact path="/showSkills">
            <ShowSkills/>
          </Route>
          {/*<Route exact path="/reportSkillEvent">
          </Route>*/}
        </Switch>
      </Router>
  );
};

export default Navigation;