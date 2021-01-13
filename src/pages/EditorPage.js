/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../AppData";
import React from 'react'
import { NavBar } from "../compos/NavBar";
import { EffectNodeEditor } from "../compos/EffectNodeEditor";

export function EditorPage () {
  const { docID } = useParams();
  const getDoc = useApp(s => s.getDoc)
  const putDoc = useApp(s => s.putDoc)
  const snapDoc = useApp(s => s.snapDoc)
  const [initState, setInitState] = useState(null)

  useEffect(() => {
    getDoc({ _id: docID })
      .then(doc => {
        setInitState(doc)
      }, () => {
        setInitState(false)
      })
  }, [docID])

  const onSave = (v) => {
    console.log(v)
    putDoc({ doc: v })
  }

  const onAutoSave = (v) => {
    console.log(v)
    putDoc({ doc: v })
  }

  const onSnap = (v) => {
    snapDoc({ doc: v })
  }

  return <div className="h-full">
    <NavBar></NavBar>
    <div style={{ height: `calc(100% - 5rem)` }}>
      {initState === null && <div>Loading...</div>}
      {initState === false && <div>Not Found...</div>}
      {initState && <EffectNodeEditor
        onSave={onSave}
        onAutoSave={onAutoSave}
        onSnap={onSnap}
        initState={initState}
      />}
    </div>
  </div>
}