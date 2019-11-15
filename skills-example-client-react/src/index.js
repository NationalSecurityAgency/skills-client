import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { SkillsConfiguration } from '@skills/skills-client-vue';

axios.get("/api/config")
  .then((result) => {
    SkillsConfiguration.configure(result.data);
  })
  .then(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
  });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
