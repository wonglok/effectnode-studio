import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

// import { DropZone } from './compos/DropZone';

// const { ipcRenderer } = window.require('electron')
// const { app } = window.require('electron').remote
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

// ipcRenderer.send('open', 'ping')
// <DropZone onFiles={console.log} className="full"></DropZone>
//

function NavBar () {
  return <div>
    <Link className="inline-block m-3 p-3 border" to="/">Home</Link>
    <Link className="inline-block m-3 p-3 border" to="/about">about</Link>
    <Link className="inline-block m-3 p-3 border" to="/topic/AAA">Topic: AAA</Link>
  </div>
}

function Topic() {
  let { topicId } = useParams();
  return (<div>
    <NavBar></NavBar>
    <h3>Requested topic ID: {topicId}</h3>
  </div>);
}

function LandingPage () {
  return <div>
    <NavBar></NavBar>
    LandingPage
  </div>
}

function AboutPage () {
  return <div>
    <NavBar></NavBar>
    AboutPage
  </div>
}

export default function App () {
  return (
    <div className="full">
      <Router>
        <Switch>
          <Route path={'/about'}>
            <AboutPage></AboutPage>
          </Route>
          <Route path={`/topic/:topicId`}>
            <Topic></Topic>
          </Route>
          <Route path={'/'}>
            <LandingPage></LandingPage>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
