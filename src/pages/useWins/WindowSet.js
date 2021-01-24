import React, { useContext, useEffect, useState } from 'react'
import { useDrag } from 'react-use-gesture'
import slugify from 'slugify'
import { MainEditor, PreviewBox } from './BuiltInWindows.js'
import { ProjectContext } from '../ProjectPage.js'
/* eslint-disable react-hooks/exhaustive-deps */
export function WindowTemplate ({ children, toolBarClassName = 'bg-green-400', initVal, showToolBtn = true, onChange = () => {} }) {
  const [rect, set] = useState(initVal || { x: 0, y: 0, w: 100, h: 100 })
  const toolbar = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => ({ ...s, x: s.x + dx, y: s.y + dy }))
    }
    if (!down) {
      onChange(rect)
    }
  })

  useEffect(() => {
    set(initVal)
  }, [initVal])

  const resizerBR = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = { ...s, w: (Number(rect.w + 0) + dx).toFixed(1), h: (Number(rect.h + 0) + dy).toFixed(1) }
        if (output.w < 100) {
          output.w = 100
        }
        if (output.h < 100) {
          output.h = 100
        }
        return output
      })
    }
    if (!down) {
      onChange(rect)
    }
  })

  const resizerBL = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = { ...s, x: rect.x + dx, w: (Number(rect.w + 0) - dx).toFixed(1), h: (Number(rect.h + 0) + dy).toFixed(1) }
        if (output.w < 100) {
          output.w = 100
          output.x -= dx
        }
        if (output.h < 100) {
          output.h = 100
        }
        return output
      })
    }
    if (!down) {
      onChange(rect)
    }
  })

  const hide = () => {
    onChange({ ...rect, hidden: true })
  }

  return <div className={"absolute group top-0 left-0 bg-white text-black overflow-hidden rounded-lg"} style={{ width: `${rect.w}px`, height: `${rect.h}px`, transform: `translate3d(${rect.x}px, ${rect.y}px, 0px)` }}>
    <div style={{ height: 25 + 'px' }} className={"w-full px-1 text-sm flex justify-between items-center " + toolBarClassName} {...toolbar()}>
      <div>
        {initVal.name}
      </div>
      {showToolBtn && <div className={'flex'}>
        <div className="h-4 w-4 mr-1 rounded-full bg-yellow-500 cursor-pointer" onClick={() => { hide() }}></div>
        <div className="h-4 w-4 rounded-full mr-1 bg-red-500 cursor-pointer" onClick={() => {  }}></div>
      </div>}
    </div>
    <div className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 right-1 bg-blue-500 cursor-move" {...resizerBR()}>
    </div>
    <div className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 left-1 bg-blue-500 cursor-move" {...resizerBL()}>
    </div>
    <div style={{ height: `${rect.h - 25}px` }}>{children}</div>
  </div>
}

export function slug (str) {
  return slugify(str, {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true     // strip special characters except replacement, defaults to `false`
  })
}

export function BuiltInWindow ({ name, pos = {}, children }) {
  let [doc, ssDoc] = useState(false)
  let slugName = slug(name)

  const { useWins } = useContext(ProjectContext)
  const wins = useWins(s => s)

  let getDocFnc = () => {
    wins.getDoc({ _id: slugName }).then(e => {
      if (!e) {
        let doc = { _id: slugName, name, x: 0, y: 0, w: 300, h: 300, ...pos, hidden: false }
        wins.setDoc({ doc })
        ssDoc(doc)
      } else {
        ssDoc(e)
      }
    })
  }
  useEffect(() => {
    getDocFnc()
  }, [slugName])

  useEffect(() => {
    let layout = () => {
      getDocFnc()
    }
    window.addEventListener('relayout', layout)
    return () => {
      window.removeEventListener('relayout', layout)
    }
  }, [])

  let onChange = (doc) => {
    wins.setDoc({ doc })
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('relayout', { detail: doc }))
    })
  }

  return <>
    {doc && !doc.hidden && <WindowTemplate showToolBtn={false} toolBarClassName={'bg-gradient-to-r from-green-600 via-green-400 to-green-800 text-white'} initVal={doc} onChange={onChange}>
      {children}
    </WindowTemplate>}
  </>
}

export function WindowSet () {
  return <div className={' text-black h-full w-full relative'}>
    <BuiltInWindow name="Main Editor" pos={{ x: 10, y: 10, w: window.innerWidth * 0.3333, h: window.innerHeight * 0.7 }}>
      <MainEditor></MainEditor>
    </BuiltInWindow>
    <BuiltInWindow name="Preview Box" pos={{ w: window.innerWidth * 0.3, h: window.innerHeight - 20 - 130, x: window.innerWidth - window.innerWidth * 0.3 - 10, y: 10 }}>
      <PreviewBox></PreviewBox>
    </BuiltInWindow>
  </div>
}

function TaskBtn ({ children, onClick }) {
  return <div onClick={onClick} className="px-3 inline-flex items-center bg-opacity-25 bg-white h-full cursor-pointer select-none mr-2 rounded-xl">{children}</div>
}

export function TaskBarSet () {
  const { useWins } = useContext(ProjectContext)
  const wins = useWins(s => s)
  let resetWindow = async (name, pos) => {
    let slugName = slug(name)
    let doc = { _id: slugName, name, ...pos, hidden: false }
    await wins.setDoc({ doc })
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('relayout'))
    })
  }

  let relayoutAll = () => {
    relayoutEditor()
    relayoutPreview()
  }

  let relayoutEditor = () => {
    resetWindow('Main Editor', { x: 10, y: 10, w: window.innerWidth * 0.3333, h: window.innerHeight * 0.7 })
  }
  let relayoutPreview = () => {
    resetWindow('Preview Box', { w: window.innerWidth * 0.3, h: window.innerHeight - 20 - 130, x: window.innerWidth - window.innerWidth * 0.3 - 10, y: 10 })
  }

  return <div className={'absolute bottom-0 left-0 w-full bg-opacity-25 bg-black h-12 p-2'}>
    <TaskBtn onClick={relayoutAll}>Relayout Windows</TaskBtn>
    {/* <TaskBtn onClick={relayoutEditor}>Main Editor</TaskBtn>
    <TaskBtn onClick={relayoutPreview}>Preview Box</TaskBtn> */}
  </div>
}
