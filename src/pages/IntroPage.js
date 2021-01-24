import React, { useRef } from 'react'
import { useEffect, useState, useMemo } from "react"
import { Layout } from "../pages-content/happy-again/NavBar"
// import { Modal } from '../pages-content/modal/Modal'
import { DropZone } from '../compos/DropZone';
import { useProjectRoots } from '../AppData'
import { useHistory } from 'react-router-dom'
import { createFiles } from './parcel/parcel.js'

function ThankYouCard ({ children, text, className, onClick }) {
  return <div className={'mb-3 p-3' + ' ' + className || ''} onClick={onClick}>
    <div style={{ border: '1px solid #F3C978', borderRadius: '10px', width: '300px', height: '400px', margin: '20px auto' }}>
      {children}
    </div>
    <div className={'text-center'} style={{ fontSize: '23px', 'whiteSpace': 'pre-wrap' }} >
      {text}
    </div>
  </div>
}


export const RecentItem = ({ doc, alt }) => {
  let history = useHistory()
  let removeDoc = useProjectRoots(s => s.removeDoc)
  let openDoc = ({ doc }) => {
    history.push(`/project?url=${encodeURIComponent(doc.path)}`)
  }

  return <div className={"px-3 m-3 flex cursor-pointer py-2 text-xs bg-gray-100 bg-gradient-to-tr text-white rounded-2xl " + (alt ? `  from-purple-400 to-red-500 ` : ` from-blue-400  to-green-500 `)}>
    <div className="flex flex-col justify-center">
      <div className="overflow-x-scroll inline-flex items-center">{doc.title}</div>
      <div className="overflow-x-scroll inline-flex items-center">{doc.path}</div>
    </div>
    <div className="w-14 ml-3 inline-flex items-center justify-center ">
      <div className={`p-3 border bg-white rounded-2xl ${alt ? `text-red-700` : `text-purple-700`}`} onClick={() => { openDoc({ doc }) }}>Open</div>
    </div>
    <div className="w-14 ml-3 inline-flex items-center justify-center ">
      <div className="p-3 border border-white rounded-2xl" onClick={() => { removeDoc({ doc }) }}>Remove</div>
    </div>
  </div>
}

export function IntroPage () {
  let [docs, setDocs] = useState([])
  let refresh = useProjectRoots(s => s.refresh)
  let getDocs = useProjectRoots(s => s.getDocs)
  let setDoc = useProjectRoots(s => s.setDoc)
  let makeDoc = useProjectRoots(s => s.makeDoc)
  let set = useProjectRoots(s => s.set)
  // let logRef = useRef()
  // let [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getDocs()
      .then(e => {
        setDocs(e)
      })
  }, [getDocs, refresh])

  let dropItem = ({ files }) => {
    const lstatSync = window.require('fs').lstatSync
    const existsSync = window.require('fs').existsSync

    files.forEach((file) => {
      let url = file.path + ''
      let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
      file.isDirectory = isDirectory
    })

    files.filter(e => e.isDirectory).filter(e => !docs.map(d => d.path).includes(e.path)).forEach(e => {
      let ar = e.path.split('/')
      let title = ar[ar.length - 1]
      let doc = {
        ...makeDoc(),
        ...e,
        title
      }
      setDoc({ doc })
    })

    set({ refresh: Math.random() })
  }

  let RecentItems = () => {
    return docs.filter(e => e).map((e, i) => {
      return <RecentItem alt={i % 2 === 0} key={e._id} doc={e}></RecentItem>
    })
  }

  let createProject = async () => {
    const lstatSync = window.require('fs').lstatSync
    const existsSync = window.require('fs').existsSync
    const { dialog } = window.require('electron').remote;
    var promise = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      createDirectory: true
    })

    let files = [{
      path: promise.filePaths[0],
      isDirectory: false
    }]

    files.forEach((file) => {
      let url = file.path + ''
      let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
      file.isDirectory = isDirectory
    })

    dropItem({ files })

    await checkBeforeCreateProject({ files })
  }

  let createProjectFiles = ({ folder }) => {
    createFiles({ folder })
    window.location.assign(`/project?url=${encodeURIComponent(folder.path)}`)
    console.log('open project')
  }

  let checkBeforeCreateProject = async ({ files }) => {
    let firstFolder = files.filter(e => e.isDirectory)[0]
    if (firstFolder) {
      const fs = window.require('fs');
      const path = window.require('path')

      const dir = fs.opendirSync(firstFolder.path);
      const infos = []
      for await (const dirEntry of dir) {
        console.log(dirEntry.name);
        infos.push({
          name: dirEntry.name,
          isDirectory: dirEntry.isDirectory(),
          isFile: dirEntry.isFile(),
          path: path.join(firstFolder.path, dirEntry.name)
        })
      }

      const vizfiles = infos.filter(info => {
        return info.name.indexOf('.') !== 0
      })

      if (vizfiles.length > 0) {
        window.alert('Please select an Empty Folder to create a new project.');
      } else if (vizfiles.length === 0) {
        createProjectFiles({ folder: firstFolder })
      }
    }
  }

  let openFolder = async () => {
    const lstatSync = window.require('fs').lstatSync
    const existsSync = window.require('fs').existsSync
    const { dialog } = window.require('electron').remote;
    var promise = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      createDirectory: true
    })

    let files = [{
      path: promise.filePaths[0],
      isDirectory: false
    }]

    files.forEach((file) => {
      let url = file.path + ''
      let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
      file.isDirectory = isDirectory
    })

    dropItem({ files })
  }

  let openNewWindow = () => {
    let electron = window.require('electron').remote
    console.log(electron.ipcMain.emit('open-window', {}))
    // ipcRemote.emit('open-window', {})
  }

  return <Layout title={'Creative Coding with Boxes and Cables'}>
    <div className="block lg:hidden text-center mt-4" style={{ fontSize: '24px', color: '#F3C978' }}>
      Creative Coding with Boxes and Cables
    </div>

    {<div className={'flex justify-center flex-wrap lg:p-4'}>
      <ThankYouCard onClick={createProject} text={'Create New Project'} className={'cursor-pointer  select-none'}>
        <div className={'h-full w-full flex justify-center items-center'}>
          <img src={require('./img/add.svg')} alt="add" />
        </div>
      </ThankYouCard>
      <ThankYouCard onClick={openFolder} text={'Browse Project Folder'} className={'cursor-pointer  select-none'}>
        <div className={'h-full w-full flex justify-center items-center'}>
          <img src={require('./img/folder.svg')} className={'scale-150 transform'} alt="Open" />
        </div>
      </ThankYouCard>
      <ThankYouCard text={'Drop Project Folder'} className={'select-none'}>
        <div className={'h-full w-full flex justify-center items-center'}>
          <DropZone onFiles={({ files }) => { dropItem({ files }) }}>
          </DropZone>
        </div>
      </ThankYouCard>
      <ThankYouCard onClick={openNewWindow} text={'Open New Window'} className={'cursor-pointer select-none'}>
        <div className={'h-full w-full flex justify-center items-center'}>
          <img src={require('./img/clone.svg')} className={'scale-150 transform'} alt="Open" />
        </div>
      </ThankYouCard>
    </div>}

    {/* {isLoading && <div className="mx-auto max-w-4xl w-full flex">Loading....</div>}
    {isLoading && <div ref={logRef} className={'mx-auto max-w-4xl w-full flex h-36 overflow-scroll'}>
    </div>} */}

    <div className={'flex justify-center items-center flex-wrap'}>
      <RecentItems></RecentItems>
    </div>

    <div className={'h-36'}></div>
  </Layout>
}
