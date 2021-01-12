import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import cx from 'classnames'
const lstatSync = window.require('fs').lstatSync
const existsSync = window.require('fs').existsSync
const { dialog } = window.require('electron').remote;

export function DropZone ({ onFiles = () => {} }) {
  const drop = useRef()
  const [message, setMessage] = useState('Drop Folder Here or Click to Select Folder')
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
        setMessage('Drop Folder Here or Click to Select Folder');
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
        properties: ['openDirectory']
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

  return <div ref={drop} onClick={() => { openClutter() }} className={' cursor-pointer h-full w-full bg-gray-100 flex justify-center items-center ' + cx({ 'bg-green-300 text-green-600': mode === 'over', 'bg-blue-300 text-blue-600': mode === 'dropped' })}>

    <span className={'select-none'}>{message}</span>
  </div>
}

//
