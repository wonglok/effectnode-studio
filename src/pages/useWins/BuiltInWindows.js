import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { runSession } from '../parcel/parcel'
import { ProjectContext } from '../ProjectPage'

export const MainEditor = () => {
  return <div>main editro</div>
}

export const PreviewBox = () => {
  const [src, setSRC] = useState()
  const { url } = useContext(ProjectContext)
  const startSession = () => {
    let onReload = ({ port, url }) => {
      console.log(url)
      setSRC(url)
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

  return <div className={'w-full h-full'} >
    <iframe className={'w-full h-full'} sandbox={'allow-downloads allow-forms allow-same-origin allow-scripts'} src={src}></iframe>
    {/* <button onClick={onCompile} className={'p-3'}>Click</button> */}
    {/* previewbox */}
  </div>
}