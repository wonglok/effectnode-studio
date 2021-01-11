import React from 'react';
import { DropZone } from './compos/DropZone';

// const { ipcRenderer } = window.require('electron')
// const { app } = window.require('electron').remote
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')

// ipcRenderer.send('open', 'ping')

export default function App () {
  return (
    <div className="full">
      <DropZone className="full"></DropZone>
    </div>
  );
}

