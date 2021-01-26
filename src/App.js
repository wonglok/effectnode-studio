/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  // useHistory
} from "react-router-dom";
import "./globals.css";

// import { EditorPage } from './pages/EditorPage'
// import { TimeMachine } from './pages/TimeMachine.js'
// import { DocsPage } from './pages/DocsPage.js'
// import { OpenFolderPage } from './pages/OpenFolderPage'

import { Welcome } from "./pages/Welcome";
import { Project } from "./pages/Project";

// import 'effectnode/dist/index.css'

// const { ipcRenderer } = window.require('electron')
// const { app } = window.require('electron').remote
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

// ipcRenderer.send('open', 'ping')

// <DropZone onFiles={console.log} className="full"></DropZone>

export default function App() {
  return (
    <div className="full">
      <Router>
        <Switch>
          {/* <Route path={'/editor/:docID'}>
            <EditorPage></EditorPage>
          </Route>
          <Route path={'/timemachine/:docID'}>
            <TimeMachine></TimeMachine>
          </Route>
          <Route path={'/docs'}>
            <DocsPage></DocsPage>
          </Route>
          <Route path={'/folder'}>
            <OpenFolderPage></OpenFolderPage>
          </Route> */}

          <Route path={'/project'}>
            <Project></Project>
          </Route>
          <Route path={"/"}>
            <Welcome></Welcome>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
