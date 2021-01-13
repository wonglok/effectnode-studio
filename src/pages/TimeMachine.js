/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { NavBar } from '../compos/NavBar'
import { useApp } from '../AppData'
import moment from 'moment'
import { EffectNodeEditor } from '../compos/EffectNodeEditor'

function Snapper ({ snap, onRemove, onRestore, onTry }) {
  return <tr>
    <td className="p-3 border">{snap.calendar}</td>
    <td className="p-3 border">{snap.format}</td>
    <td className="p-3 border text-red-500" onClick={() => { window.confirm('delte?') && onRemove({ snap }) }}>Remove</td>
    <td className="p-3 border text-blue-500" onClick={() => { window.confirm('restore?') && onRestore({ snap }) }}>Restore</td>
    <td className="p-3 border text-blue-500 hover:text-blue-700 hover:bg-gray-200" onClick={() => { onTry({ snap }) }} onPointerEnter={() => { onTry({ snap }) }}>Try</td>
  </tr>
}

export function TimeMachine () {
  const getDocSnaps = useApp(s => s.getDocSnaps)
  const removeSnap = useApp(s => s.removeSnap)
  const putDoc = useApp(s => s.putDoc)
  const refresher = useApp(s => s.refresher)
  const refresh = useApp(s => s.refresh)
  const [snaps, setSnaps] = useState([])
  const { docID } = useParams()
  const history = useHistory()

  useEffect(() => {
    getDocSnaps({ _id: docID })
      .then((v) => {
        setSnaps(v)
      })
    return () => {
    }
  }, [refresher])

  let getTimes = () => {
    return snaps.map(e => {
      return {
        ...e,
        calendar: moment(new Date(e.timestamp)).calendar(),
        format: moment(new Date(e.timestamp)).format('MMMM Do YYYY, h:mm:ss a')
      }
    })
  }

  let onRestore = async ({ snap }) => {
    await putDoc({ doc: snap })
    history.push(`/editor/${snap._id}`)
    refresh()
  }

  let onRemove = ({ snap }) => {
    removeSnap({ snap })
    refresh()
  }

  let onTry = ({ snap }) => {
    // setInitState(false)
    setTimeout(() => {
      setInitState(JSON.parse(JSON.stringify(snap)))
    })
  }

  let Snaps = () => {
    return getTimes().map(e => {
      return <Snapper key={e.snapID} onRemove={onRemove} onRestore={onRestore} onTry={onTry} snap={e}></Snapper>
    })
  }

  let [initState, setInitState] = useState(false)

  return <div className={'h-full'}>
    <div style={{ height: '5rem' }}>
      <NavBar></NavBar>
    </div>
    <div style={{ height: `calc(100% - 5rem)` }}>
      <div>Time Machine {docID}</div>
      <div className={'flex h-full'}>
        <div className="w-1/2 h-full">
          <table >
            <thead>
              <tr>
                <td className="text-center">Snapshot</td>
                <td className="text-center">Date Time</td>
                <td className="text-center">Remove</td>
                <td className="text-center">Restore</td>
                <td className="text-center">Try</td>
              </tr>
            </thead>
            <tbody>
              <Snaps></Snaps>
            </tbody>
          </table>
        </div>
        <div className=" w-1/2 h-full">
          {initState && <EffectNodeEditor initState={initState}></EffectNodeEditor>}
        </div>
      </div>

    </div>

    {/* <pre>{JSON.stringify(getTimes(), null, '  ')}</pre> */}
  </div>
}

//
