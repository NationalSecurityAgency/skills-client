import React from 'react';
import logo from './logo.svg';
import Navigation from "./skillsDisplay/Navigation";
import './App.css';

export default function App() {
  return (
    <div className="App">
      <Navigation projectId="movies"/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
