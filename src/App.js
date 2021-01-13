/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom"

import { EditorPage } from './pages/EditorPage'
import { TimeMachine } from './pages/TimeMachine.js'
import { NavBar } from './compos/NavBar'
import { useApp } from './AppData'

// import 'effectnode/dist/index.css'
// import { DropZone } from './compos/DropZone';

// const { ipcRenderer } = window.require('electron')
// const { app } = window.require('electron').remote
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

// ipcRenderer.send('open', 'ping')
// <DropZone onFiles={console.log} className="full"></DropZone>

function DocItem ({ doc }) {
  let history = useHistory()
  let go = ({ doc }) => {
    history.push(`/editor/${doc._id}`)
  }

  return <div onClick={() => go({ doc })}>{doc._id}</div>
}

function DocsPage () {
  let history = useHistory()
  let getDocs = useApp(s => s.getDocs)
  let refresher = useApp(s => s.refresher)
  const [docs, setDocs] = useState([])
  const [canWork, setCanWork] = useState(true)

  let makeDoc = useApp(s => s.makeDoc)
  let putDoc = useApp(s => s.putDoc)

  let createPage = async () => {
    let newDoc = makeDoc()
    await putDoc({ doc: newDoc })
    history.push(`/editor/${newDoc._id}`)
  }

  useEffect(() => {
    if (canWork) {
      getDocs()
      .then((docs) => {
        setDocs(docs)
      })
    }

    return () => {
      setCanWork(false)
    }
  }, [refresher])

  return <div>
    <NavBar></NavBar>

    Docs Page

    <button onClick={createPage}>Create Page</button>

    {docs.map(d => <DocItem key={d._id} doc={d}></DocItem>)}
  </div>
}


export default function App () {
  return (
    <div className="full">
      <Router>
        <Switch>
          <Route path={'/editor/:docID'}>
            <EditorPage></EditorPage>
          </Route>
          <Route path={'/timemachine/:docID'}>
            <TimeMachine></TimeMachine>
          </Route>
          <Route path={'/'}>
            <DocsPage></DocsPage>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
