import React, { useContext, useEffect, useRef, useState } from 'react'
import { runSession, watchFiles } from '../parcel/parcel'
import { ProjectContext } from '../ProjectPage'
// import { ipcRenderer } from 'electron'
/* eslint-disable react-hooks/exhaustive-deps */

export const MainEditor = () => {
  const [root, setRoot] = useState({ tree: { children: [] } })
  const { url } = useContext(ProjectContext)


  useEffect(() => {
    watchFiles({ projectRoot: url, onTree: (tree) => { setRoot(tree) } })
  }, [])

  let openFile = ({ file }) => {
    let { ipcRenderer } = window.require('electron')
    ipcRenderer.send('open', file.path)
  }

  let coreFile = `${url}/src/js/entry.js`

  return <div className="whitespace-pre">
  <div className=" p-3 text-xl" key={`file-${coreFile}`} onClick={() => openFile({ file: { path: coreFile } })}>{'entry-file'}</div>
    {root.tree.children.map((file, i) => {
      return <div className=" p-3 text-xl" key={`file-${file.path}`} onClick={() => openFile({ file })}>{file.name}</div>
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

  // let checkReady = () => {
  //   let sender = () => {
  //     push(true)
  //     setReady(true)
  //     webview.current.removeEventListener('dom-ready', sender)
  //   }
  //   webview.current.addEventListener('dom-ready', sender)
  // }

  const startSession = () => {
    let ready = false

    let pushHydration = ({ detail }) => {
      let tt = 0
      tt = setInterval(() => {
        if (ready) {
          clearInterval(tt)
          webview.current.executeJavaScript(`
            if (window.SYNCInputs) {
              window.SYNCInputs(${JSON.stringify(detail)});
            } else {
              console.log('window.SYNCInputs not found');
            }
          `);
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

      pushHydration({ detail: { water: 'water' } })
    }

    try {
      runSession({ projectRoot: url, onReload })
    } catch (e) {
      console.log(e)
    }

    window.addEventListener('hydrate', pushHydration)
    return () => {
      window.removeEventListener('hydrate', pushHydration)
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