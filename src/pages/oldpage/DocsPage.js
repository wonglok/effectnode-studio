/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom"
import { NavBar } from '../compos/NavBar'
import { useApp } from '../AppData'


function DocItem ({ doc }) {
  let history = useHistory()
  let go = ({ doc }) => {
    history.push(`/editor/${doc._id}`)
  }

  return <div onClick={() => go({ doc })}>{doc._id}</div>
}

export function DocsPage () {
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
