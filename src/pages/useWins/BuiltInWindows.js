import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { runSession, watchFiles } from '../parcel/parcel'
import { ProjectContext } from '../ProjectPage'
import { getLowDB } from './useLow'
import _ from 'lodash'
// import { ipcRenderer } from 'electron'
/* eslint-disable react-hooks/exhaustive-deps */

export const ValueEditor = () => {
  const path = window.require('path')
  const { url } = useContext(ProjectContext)
  const db = useMemo(() => {
    return getLowDB({ filePath: path.join(url, './src/js/meta.json') })
  }, [])

  const [num, setNum] = useState(db.get('number').value())

  let onChange = (ev) => {
    let val = ev.target.value

    db.set('number', val).write()
    setNum(val)

    window.dispatchEvent(new CustomEvent('flush', { detail: {} }))
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('flush', { detail: {} }))
  }, [url])

  return <div>
    <input type="range" step="0.1" min="0" max="100" value={num} onChange={onChange} />
  </div>
}

export const MainEditor = () => {
  const [root, setRoot] = useState({ tree: { children: [] } })
  const { url } = useContext(ProjectContext)

  useEffect(() => {
    watchFiles({ projectRoot: url, onTree: (tree) => { setRoot(tree) } })
  }, [])

  let openFileEditor = ({ file }) => {
    let { ipcRenderer } = window.require('electron')
    ipcRenderer.send('open', file.path)
  }

  let coreFile = `${url}/src/js/entry.js`

  return <div className="whitespace-pre">
    <ValueEditor></ValueEditor>
  <div className=" p-3 text-xl" key={`file-${coreFile}`} onClick={() => openFileEditor({ file: { path: coreFile } })}>{'entry-file'}</div>
    {root.tree.children.map((file, i) => {
      return <div className=" p-3 text-xl" key={`file-${file.path}`} onClick={() => openFileEditor({ file })}>{file.name}</div>
    })}
    {JSON.stringify(root.tree.children, null, '\t')}
  </div>
}

export const PreviewBox = () => {
  const webview = useRef()
  const scroller = useRef()
  const { url } = useContext(ProjectContext)
  // const [src, setSrc] = useState('about:blank')
  const [logs, setLogs] = useState([])
  const path = window.require('path')
  const fs = window.require('fs')
  const db = useMemo(() => {
    return getLowDB({ filePath: path.join(url, './src/js/meta.json') })
  }, [])

  useEffect(() => {
    let logger = (e) => {
      if (!webview.current) {
        return
      }

      console.log('[GUEST]:', e.message)
      setLogs(s => [...s, e.message])
      scroller.current.scrollTop = scroller.current.scrollHeight
    }

    webview.current.addEventListener('console-message', logger)
    return () => {
      webview.current.removeEventListener('console-message', logger)
    }
  }, [])

  const startSession = () => {
    let ready = false

    let delayedSave = _.debounce((json) => {
      if (json.boxes && json.cables) {
        fs.writeFileSync(path.join(url, './src/js/meta.json'), JSON.stringify(json), 'utf-8')
      }
    }, 1000)

    let pushHydration = () => {
      let tt = 0
      tt = setInterval(() => {
        if (ready) {
          clearInterval(tt)
          webview.current.executeJavaScript(`
            if (window.StreamInput) {
              window.StreamInput(${JSON.stringify(db.getState())});
            } else {
              console.log('window.StreamInput not found');
            }
          `);
          delayedSave(db.getState())
        }
      })
    }

    let onReload = ({ port, url }) => {
      // console.log(webview.current.src)
      // setSrc(url)
      setLogs([])
      ready = false
      webview.current.src = url

      let sender = () => {
        ready = true
        webview.current.removeEventListener('dom-ready', sender)
      }
      webview.current.addEventListener('dom-ready', sender)

      pushHydration()
    }

    try {
      runSession({ projectRoot: url, onReload })
    } catch (e) {
      console.log(e)
    }

    window.addEventListener('flush', pushHydration)
    return () => {
      window.removeEventListener('flush', pushHydration)
    }
  }

  useEffect(() => {
    return startSession()
  }, [])

  return <div className={'w-full h-full'}>
    <webview className={'w-full'} style={{ height: 'calc(100% - 250px)' }} ref={webview}></webview>
    <div className={'w-full overflow-scroll'} ref={scroller} style={{ height: `250px` }}>
      {logs.map((log, li) => <div key={'aa' + li} className={'p-1 mt-1 text-sm border bg-yellow-200 whitespace-pre'}>{log}</div>)}
    </div>
  </div>
}