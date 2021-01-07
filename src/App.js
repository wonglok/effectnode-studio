import React from 'react';
import logo from './logo.svg';
import './App.css';

const {app} = window.require('electron').remote;

export default function App() {

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>React + Electron = <span role="img" aria-label="love">😍</span></h2>
        </div>
        <p className="App-intro">
          Version: <b>{app.getVersion()}</b>
        </p>
      </div>
    );

}
