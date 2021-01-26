import React, { useContext, useEffect, useRef } from 'react'
import { ProjectContext } from '../ProjectPage'
import { useServer, useWorkbench } from './useWorkbench'

export function PreviewBox () {
  const webview = useRef()
  const { url } = useContext(ProjectContext)
  const { state } = useWorkbench({ projectRoot: url })
  const { previewURL } = useServer({ projectRoot: url })

  useEffect(() => {
    let logger = (e) => {
      console.log(`[GUEST]`, e.message)
    }
    webview.current.addEventListener('console-message', logger)
    return () => {
      webview.current.removeEventListener('console-message', logger)
    }
  }, [])

  useEffect(() => {
    let sendJS = () => {
      webview.current.executeJavaScript(`
        if (window.StreamInput) {
          window.StreamInput(${JSON.stringify(state)});
        } else {
          console.log('window.StreamInput not found');
        }
      `);
    }
    let once = () => {
      sendJS()
      webview.current.removeEventListener('dom-ready', once)
    }
    webview.current.addEventListener('dom-ready', once)
    webview.current.src = previewURL
    console.log(previewURL)
  })

  return <div className="h-full w-full">
    <webview ref={webview} className="h-full"></webview>
  </div>
}
