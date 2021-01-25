import React, { useContext, useLayoutEffect, useRef, useState } from 'react'
import { useDrag, useWheel } from 'react-use-gesture'
import { ProjectContext } from '../ProjectPage'
import { useWorkbench } from './useWorkbench'

export function Box ({ box }) {
  const { url } = useContext(ProjectContext)
  const { updateBox } = useWorkbench({ projectRoot: url })
  const [drag, setDrag] = useState({ x: box.x, y: box.y })
  const bind = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      setDrag(s => {
        return { ...s, x: s.x + dx, y: s.y + dy }
      })
    } else {
      updateBox({ ...box, ...drag })
    }
    // console.log([dx, dy])
  })

  let paddingX = 10
  let fontSize = 18
  let paddingY = 8
  return <g transform={`translate(${drag.x}, ${drag.y})`}>
    <rect {...bind()} stroke={'red'} fill="transparent" width={box.name.length * 10 + paddingX} height={fontSize + paddingY + 30 * 2}>
    </rect>
    <text className="select-none" {...bind()} x={paddingX} y={fontSize + 30 + 1} fontSize={fontSize + 'px'}>{box.name}</text>
    <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text>
  </g>
}

export function SVGEditor ({ rect, state }) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
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
  return <svg {...bind()} width={rect.width} height={rect.height} viewBox={`${pan.x} ${pan.y} ${rect.width} ${rect.height}`}>
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
