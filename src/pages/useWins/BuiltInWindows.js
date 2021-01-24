import React, { useContext, useEffect, useRef, useState } from 'react'
import { runSession } from '../parcel/parcel'
import { ProjectContext } from '../ProjectPage'
/* eslint-disable react-hooks/exhaustive-deps */

export const MainEditor = () => {
  return <div>{JSON.stringify({
    a: 12312, b: 123
  })}</div>
}

export const PreviewBox = () => {
  const [src, setSrc] = useState('about:blank')
  const webview = useRef()
  const scroller = useRef()
  const { url } = useContext(ProjectContext)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    let logger = (e) => {
      if (!webview.current) {
        return
      }
      console.log('[GUEST]:', e.message)
      setLogs(s => [...s, JSON.stringify(e.message)])
      scroller.current.scrollTop = scroller.current.scrollHeight
    }
    webview.current.addEventListener('console-message', logger)
    return () => {
      webview.current.removeEventListener('console-message', logger)
    }
  }, [])

  const startSession = () => {
    let onReload = ({ port, url }) => {
      setSrc(url)
    }

    try {
      runSession({ projectRoot: url, onReload })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    startSession()
  }, [])

  //

  return <div className={'w-full h-full'}>
    <webview className={'w-full'} style={{ height: 'calc(100% - 250px)' }} src={src} ref={webview}></webview>
    <div className={'w-full overflow-scroll'} ref={scroller} style={{ height: `250px` }}>
      {logs.map((log, li) => <div key={'aa' + li} className={'p-1 mt-1 text-sm border bg-yellow-200'}>{log}</div>)}
    </div>
  </div>
}