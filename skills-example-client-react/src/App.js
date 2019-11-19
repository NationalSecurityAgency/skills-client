import React from 'react';
import Navigation from "./skillsDisplay/Navigation";
import './App.css';
import {
    HashRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import ShowSkills from "./skillsDisplay/ShowSkills";
import ReportSkill from "./skillsDisplay/ReportSkill";

export default function App() {
  return (
    <Router>
      <div className="App">
        <Navigation projectId="movies"/>
      </div>
      <Switch>
        <Route exact path="/showSkills">
          <ShowSkills/>
        </Route>
        <Route exact path="/">
          <ReportSkill/>
        </Route>
          {/*<Route exact path="/reportSkillEvent">
        </Route>*/}
      </Switch>
    </Router>
  );
}
