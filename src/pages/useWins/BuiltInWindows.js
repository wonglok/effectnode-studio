import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { runSession } from '../parcel/parcel'
import { ProjectContext } from '../ProjectPage'

export const MainEditor = () => {
  return <div>main editro</div>
}

export const PreviewBox = () => {
  const [src, setSRC] = useState()
  const webview = useRef()
  const scroller = useRef()
  const { url } = useContext(ProjectContext)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    let logger = (e) => {
      console.log('[GUEST]:', e)
      setLogs(s => [...s, JSON.stringify(e.message)])
      scroller.current.scrollTop = scroller.current.scrollHeight
    }
    webview.current.addEventListener('console-message', logger)
    return () => {
      webview.current.removeEventListener('console-message', logger)
    }
  }, [webview.current])


  const startSession = () => {
    let onReload = ({ port, url }) => {

      setSRC('about:blank')
      setTimeout(() => {
        setSRC(url)
      }, 10)
    }

    try {
      runSession({ projectRoot: url, onReload })
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    startSession({})
  }, [])

  return <div className={'w-full h-full'}>
    <webview className={'w-full'} style={{ height: 'calc(100% - 200px)' }} ref={webview} src={src}></webview>
    <div className={'w-full overflow-scroll'} ref={scroller} style={{ height: `200px` }}>
      {logs.map((log, li) => <div key={'aa' + li} className={'p-1 my-1 border bg-yellow-400'}>{log}</div>)}
    </div>
  </div>
}