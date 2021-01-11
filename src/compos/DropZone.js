import React, { useState } from 'react'
import { useEffect, useRef } from "react"
import cx from 'classnames'

export function DropZone ({ onFiles = () => {} }) {
  const drop = useRef()
  const [message, setMessage] = useState('Drop Zone Ready')
  const [mode, setMode] = useState('ready')

  useEffect(() => {
    let dropper = drop.current
    const lstatSync = window.require('fs').lstatSync
    const existsSync = window.require('fs').existsSync

    dropper.addEventListener('drop', (event) => {

      event.preventDefault();
      event.stopPropagation();

      let files = []
      for (const f of event.dataTransfer.files) {
        // Using the path attribute to get absolute file path
        // console.log('File Path of dragged files: ', f.path)
        files.push(f)
      }

      files.forEach((file) => {
        let url = file.path + ''
        let isDirectory = existsSync(url) && lstatSync(url).isDirectory()
        file.isDirectory = isDirectory
      })

      onFiles({ files })
      setMessage(`${files.length} File(s) / Folder(s) Dropped`);
      setMode(`dropped`)
      // dropper.dispatchEvent(new CustomEvent('drop-read-files', { detail: { files } }))
    });

    let h = {
      dragover: (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('drag over')
        setMessage('Can Drop')
      },
      dragenter: (event) => {
        console.log('File is in the Drop Space');
        setMessage('Drop Zone Ready');
        setMode('over');
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
  }, [])

  return <div ref={drop} className={'h-full w-full bg-gray-100 flex justify-center items-center ' + cx({ 'bg-green-300': mode === 'over', 'bg-blue-300': mode === 'dropped' })}>
    {message}
  </div>
}

//
