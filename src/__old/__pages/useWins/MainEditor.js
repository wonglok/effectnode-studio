import React, { useContext, useLayoutEffect, useRef, useState } from 'react'
import { useDrag, useWheel } from 'react-use-gesture'
import { ProjectContext } from '../ProjectPage'
import { useWorkbench } from './useWorkbench'

export function Box ({ box }) {
  const { url, useWins } = useContext(ProjectContext)
  const wins = useWins(s => s)
  const { updateBox } = useWorkbench({ projectRoot: url })
  const [drag, setDrag] = useState({ x: box.x, y: box.y })
  const bind = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      setDrag(s => {
        return { ...s, x: s.x + dx, y: s.y + dy }
      })
    } else if (!down) {
      updateBox({ ...box, ...drag })
    }
    // console.log([dx, dy])
  })

  let openFileEditor = ({ box }) => {
    let { ipcRenderer } = window.require('electron')
    ipcRenderer.send('open', box.path, url)
  }

  const onClickLabel = async () => {
    // let doc = { _id: box._id, name: box.name, x: 20, y: 20, w: 400, h: 300, hidden: false, type: 'user' }
    // await wins.setDoc({ doc })
    openFileEditor({ box: box })
  }

  let paddingX = 10
  let fontSize = 16
  let paddingY = 8
  let chars = 6
  return <g transform={`translate(${drag.x}, ${drag.y})`}>
    <rect {...bind()} onClick={onClickLabel} stroke={'white'} fill="#ececec" width={chars * 10 + paddingX} height={fontSize + paddingY}>
    </rect>
    <text onClick={onClickLabel} className="select-none" fill={"#ececec"} {...bind()} x={chars * 10 + paddingX + paddingX} y={fontSize + 1} fontSize={fontSize + 'px'}>{box.name}</text>
    {/* <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text> */}
  </g>
}

export function SVGEditor ({ rect, state }) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const { url } = useContext(ProjectContext)
  const { addBox } = useWorkbench({ projectRoot: url })
  const bind = useWheel(({ wheeling, delta: [dx, dy] }) => {
    if (wheeling) {
      setPan(s => {
        return { ...s, x: s.x + dx, y: s.y + dy }
      })
    }
  })

  const boxes = state.boxes.map(e => {
    return (
      <Box key={e._id} box={e}></Box>
    )
  })

  const addModule = () => {
    addBox()
  }
  return <svg {...bind()} style={{ backgroundColor: '#232323' }} width={rect.width} height={rect.height} viewBox={`${pan.x} ${pan.y} ${rect.width} ${rect.height}`}>
    <text x={10} y={10 + 17} onClick={addModule} fontSize="17" fill="white">Add Module</text>
    {boxes}
  </svg>
}

export function MainEditor () {
  let ref = useRef()
  let { url } = useContext(ProjectContext)
  let { state } = useWorkbench({ projectRoot: url })
  let [rect, setRect] = useState(false)
  useLayoutEffect(() => {
    let rect = ref.current.getBoundingClientRect()
    setRect(rect)

    let relayout = ({ detail }) => {
      let rect = ref.current.getBoundingClientRect()
      setRect(rect)
    }
    window.addEventListener('relayout', relayout)

    return () => {
      window.removeEventListener('relayout', relayout)
    }
  }, [])

  return <div ref={ref} className="h-full w-full">
    {/* <pre className={'debug'}>{JSON.stringify(state, null, '  ')}</pre> */}
    {rect && <SVGEditor rect={rect} state={state}></SVGEditor>}
  </div>
}
