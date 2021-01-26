import React from 'react'
import {
  // BrowserRouter as Router,
  // Switch,
  // Route,
  useParams,
  NavLink,
  useHistory,
  // useHistory
} from "react-router-dom"
import { useApp } from '../AppData'

export function NavBar () {
  let history = useHistory()
  let { docID } = useParams()
  let snapDoc = useApp(s => s.snapDoc)
  let refresh = useApp(s => s.refresh)
  let takeSnap = async () => {
    await snapDoc({ _id: docID })
    refresh()
    history.push(`/timemachine/${docID}`)

  }
  return <div style={{ height: `5rem` }}>
    <NavLink exact activeClassName="border border-blue-700" className="inline-block m-3 p-3 border" to="/">Project Home</NavLink>
    {docID && `/`}
    {docID && <NavLink exact activeClassName="border border-blue-700" className="inline-block ml-3 mr-3 p-3 border" to={`/editor/${docID}`}>Editor</NavLink>}
    {docID && <NavLink exact activeClassName="border border-blue-700" className="inline-block mr-3 p-3 border" to={`/timemachine/${docID}`}>TimeMachine</NavLink>}
    {docID && <button className="inline-block mr-3 p-3 border bg-green-100 text-green-600 rounded-lg border-green-200 text-xs" onClick={takeSnap}>Take Snapshot</button>}
  </div>
}