import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import cx from 'classnames'
const lstatSync = window.require('fs').lstatSync
const existsSync = window.require('fs').existsSync
const { dialog } = window.require('electron').remote;

export function DropZone ({ children, onFiles = () => {} }) {
  const drop = useRef()
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('ready')

  useEffect(() => {
    let dropper = drop.current

    dropper.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();

      let files = []
      for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        // console.log('File Path of dragged files: ', f.path)
        files.push({
          path: f.path + '',
          isDirectory: false
        })
      }

      files.forEach((file) => {
        let url = file.path + ''
        let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
        file.isDirectory = isDirectory
      })

      setMessage(`${files.length} File(s) / Folder(s) Dropped`);
      setMode(`dropped`)
      onFiles({ files })
      // dropper.dispatchEvent(new CustomEvent('drop-read-files', { detail: { files } }))
    });

    let h = {
      dragover: (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('drag over')
        setMessage('Can Drop')
      },
      dragenter: (event) => {
        console.log('File is in the Drop Space');
        setMessage('');
      },
      dragleave: (event) => {
        console.log('File has left the Drop Space');
        setMessage('File has left the Drop Space')
        setMode('ready');
      }
    }

    dropper.addEventListener('dragover', h.dragover);
    dropper.addEventListener('dragenter', h.dragenter);
    dropper.addEventListener('dragleave', h.dragleave);

    return () => {
      dropper.removeEventListener('dragover', h.dragover);
      dropper.removeEventListener('dragenter', h.dragenter);
      dropper.removeEventListener('dragleave', h.dragleave);
    }
  }, [onFiles])

  let openClutter = async () => {
    var promise = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        createDirectory: true
    });

    let files = [{
      path: promise.filePaths[0],
      isDirectory: false
    }]
    files.forEach((file) => {
      let url = file.path + ''
      let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
      file.isDirectory = isDirectory
    })

    setMessage(`${files.length} File(s) / Folder(s) Dropped`);
    setMode(`dropped`)
    onFiles({ files })
  }
  // ddonClick={() => { openClutter() }}
  return <div ref={drop} className={' h-full w-full flex justify-center items-center ' + cx({ 'text-green-600': mode === 'over' || mode === 'dropped' })}>
    <div className={'flex justify-center items-center flex-col'}>
      <img src={require('../pages/img/circle.svg')} className={'mb-3'} />
      <span className={'select-none text-lg'}>{message}</span>
    </div>
  </div>
}

//
