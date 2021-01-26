// import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
// import { runSession, watchFiles } from '../parcel/parcel'
// import { ProjectContext } from '../ProjectPage'
// import { getLowDB } from './useLow'
// import _ from 'lodash'
// import moment from 'moment'
// import { slug } from './WindowSet'
// // import { ipcRenderer } from 'electron'
// /* eslint-disable react-hooks/exhaustive-deps */

// let getID = () => `_${(Math.random() * 100000000).toFixed(0)}`

// export const ModuleManager = () => {
//   const path = window.require('path')
//   const fs = window.require('fs-extra')
//   const { url } = useContext(ProjectContext)
//   const db = useMemo(() => {
//     return getLowDB({ filePath: path.join(url, './src/js/meta.json') })
//   }, [])

//   const [refresh, setRefresh] = useState(0)

//   useEffect(() => {
//     let onTree = () => {
//       window.dispatchEvent(new CustomEvent('reload', { detail: {} }))
//     }
//     return watchFiles({ projectRoot: url, onTree })
//   }, [])

//   const state = useMemo(() => {
//     return db.getState()
//   }, [refresh])

//   const smalltalk = require('smalltalk')

//   const addBox = async () => {
//     let _id = getID()

//     let name = await smalltalk.prompt('Please enter name for your new box.', 'Example: newbox')
//     name = name || 'box'
//     name = slug(name)
//     let file = `${name}__ID__${_id}.js`
//     let filePath = path.join(url, `./src/js/boxes/${file}`)
//     db.get('boxes').push({
//       _id,
//       x: 0,
//       y: 0,
//       name,
//       file,
//       path: filePath
//     }).write()

//     fs.ensureDirSync(path.join(url, `./src/js/boxes/`))

//     fs.ensureFileSync(filePath)
//     fs.writeFileSync(filePath, /* jsx */`
// module.exports = () => {
// }
//     `, 'utf-8')

//     window.dispatchEvent(new Event('save'))
//     setRefresh(s => s + 1)
//   }

//   let openFileEditor = ({ root, file }) => {
//     let { ipcRenderer } = window.require('electron')
//     ipcRenderer.send('open', file.path, root)
//   }

//   let removeBox = ({ file }) => {
//     let _id = file._id
//     db.get('boxes').remove({ _id }).write()
//     fs.removeSync(path.join(url, `./src/js/boxes/${file.file}`))

//     window.dispatchEvent(new Event('save'))
//     setRefresh(s => s + 1)
//   }

//   return (<div>
//     <button onClick={addBox}>Add Module</button>
//     {state.boxes.map(e => <div className={'bg-gray-300 p-3 m-3'} key={e._id} >
//       {e.name}
//       <div>
//         <button onClick={() => { removeBox({ file: e }) }}>Remove</button>
//       </div>
//       <div>
//         <button onClick={() => { openFileEditor({ root: url, file: e }) }}>Editor</button>
//       </div>
//     </div>)}
//   </div>)
// }

// // export const NumberEditor = () => {
// //   const path = window.require('path')
// //   const { url } = useContext(ProjectContext)
// //   const db = useMemo(() => {
// //     return getLowDB({ filePath: path.join(url, './src/js/meta.json') })
// //   }, [])
// //   const [num, setNum] = useState(db.get('number').value() || 0)

// //   let onChange = (ev) => {
// //     let val = ev.target.value
// //     db.set('number', val).write()

// //     setTimeout(() => {
// //       setNum(val)
// //     })
// //   }

// //   useEffect(() => {
// //     window.dispatchEvent(new CustomEvent('flush', { detail: {} }))
// //   }, [url])

// //   return <div>
// //     <input type="range" step="0.1" min="0" max="100" value={num} onChange={onChange} />
// //   </div>
// // }



// // export const CodeEditorOpener = () => {
// //   const [root, setRoot] = useState({ tree: { children: [] } })
// //   const { url } = useContext(ProjectContext)

// //   useEffect(() => {
// //     watchFiles({ projectRoot: url, onTree: (tree) => {
// //       tree.tree = tree.tree || { children: [] }
// //       setRoot(tree)
// //     } })
// //   }, [])

// //   let openFileEditor = ({ root, file }) => {
// //     let { ipcRenderer } = window.require('electron')
// //     ipcRenderer.send('open', file.path, root)
// //   }

// //   let coreFile = `${url}/src/js/entry.js`

// //   return <div className="whitespace-pre">
// //     <div className=" p-3 text-xl" key={`file-${coreFile}`} onClick={() => openFileEditor({ root: url, file: { path: coreFile } })}>{'entry-file'}</div>
// //     {root.tree.children.map((file, i) => {
// //       return <div className=" p-3 text-xl" key={`file-${file.path}`} onClick={() => openFileEditor({ root: url, file })}>{file.name}</div>
// //     })}
// //     {JSON.stringify(root.tree.children, null, '\t')}
// //   </div>
// // }

// export const MainEditor = () => {
//   // const { url } = useContext(ProjectContext)
//   return <div className="whitespace-pre">
//     <ModuleManager></ModuleManager>
//     {/* <NumberEditor></NumberEditor> */}
//     {/* <CodeEditorOpener></CodeEditorOpener> */}
//   </div>
// }

// export const PreviewBox = () => {
//   const webview = useRef()
//   const scroller = useRef()
//   const { url } = useContext(ProjectContext)
//   const [logs, setLogs] = useState([])
//   const path = window.require('path')
//   const fs = window.require('fs-extra')
//   const db = useMemo(() => {
//     return getLowDB({ filePath: path.join(url, './src/js/meta.json') })
//   }, [])

//   useEffect(() => {
//     let page = `data:text/html;charset=utf-8,<style> @keyframes fade { 0% { opacity: 0; } 100% { opacity: 1; } } .blinking{ animation: fade 1s cubic-bezier(0, 0.2, 0.8, 1) infinite; }</style><div style="display: flex; align-items: center; justify-content: center; font-family: Arial; height: 100vh;" class="blinking">Preparing Compiler...</div>`
//     webview.current.src = page
//     let logger = (e) => {
//       if (!webview.current) {
//         return
//       }
//       console.log(e)

//       console.log('[GUEST]:', e.message)
//       setLogs(s => {
//         let logsss = s.length
//         if (logsss >= 100) {
//           return [...s, e.message].slice().reverse().filter((e, i) => { return i <= (100) }).reverse()
//         } else {
//           return [...s, e.message]
//         }
//       })
//       scroller.current.scrollTop = scroller.current.scrollHeight
//     }

//     webview.current.addEventListener('console-message', logger)
//     return () => {
//       webview.current.removeEventListener('console-message', logger)
//     }
//   }, [])

//   const startSession = () => {
//     let readyToFlush = false

//     let saveInstant = (json) => {
//       let tag = moment().format('YYYY-MM-DD__[time]__hh-mm-ss-a') + '__randomID_' + getID()
//       fs.writeFileSync(path.join(url, './src/js/meta.json'), JSON.stringify(json, null, '\t'), 'utf-8')
//     }
//     let saveToDisk = (json) => {
//       let tag = moment().format('YYYY-MM-DD__[time]__hh-mm-ss-a') + '__randomID_' + getID()
//       fs.ensureDirSync(path.join(url, `./src/js/meta_backup/`))
//       fs.copyFileSync(path.join(url, './src/js/meta.json'), path.join(url, `./src/js/meta_backup/meta_${tag}.json`))
//       fs.writeFileSync(path.join(url, './src/js/meta.json'), JSON.stringify(json, null, '\t'), 'utf-8')
//     }
//     let debouncedSaveToDisk = _.debounce(saveToDisk, 10 * 1000, { leading: true })

//     window.addEventListener('reload', () => {
//       let url = webview.current.src
//       webview.current.src = ''
//       let sender = () => {
//         webview.current.src = url
//         webview.current.removeEventListener('dom-ready', sender)
//       }
//       webview.current.addEventListener('dom-ready', sender)
//     })

//     let flushState = () => {
//       let tt = 0
//       tt = setInterval(() => {
//         if (readyToFlush) {
//           clearInterval(tt)
//           webview.current.executeJavaScript(`
//             if (window.StreamInput) {
//               window.StreamInput(${JSON.stringify(db.getState())});
//             } else {
//               console.log('window.StreamInput not found');
//             }
//           `);
//           debouncedSaveToDisk(db.getState())
//         }
//       })
//     }

//     let onReload = ({ port, url }) => {
//       // console.log(webview.current.src)
//       // setSrc(url)
//       setLogs([])
//       readyToFlush = false
//       webview.current.src = url

//       let sender = () => {
//         readyToFlush = true
//         webview.current.removeEventListener('dom-ready', sender)
//       }
//       webview.current.addEventListener('dom-ready', sender)

//       flushState()
//     }

//     let saveNow = () => {
//       saveInstant(db.getState())
//     }

//     try {
//       runSession({ projectRoot: url, onReload })
//     } catch (e) {
//       console.log(e)
//     }

//     window.addEventListener('save', saveNow)
//     window.addEventListener('flush', flushState)
//     return () => {
//       window.removeEventListener('save', saveNow)
//       window.removeEventListener('flush', flushState)
//     }
//   }

//   useEffect(() => {
//     return startSession()
//   }, [])

//   return <div className={'w-full h-full'}>
//     <webview className={'w-full'} style={{ height: 'calc(100% - 250px)' }} ref={webview}></webview>
//     <div className={'w-full overflow-scroll'} ref={scroller} style={{ height: `250px` }}>
//       {logs.map((log, li) => <div key={'aa' + li} className={'p-1 mt-1 text-sm border bg-yellow-200 whitespace-pre'}>{log}</div>)}
//     </div>
//   </div>
// }

