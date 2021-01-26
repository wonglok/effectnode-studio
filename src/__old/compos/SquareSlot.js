/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { Color } from 'three'
import { SLOT_WIDTH } from './Const'
// import { BLOCK_TALL, BLOCK_HEIGHT, BLOCK_WIDTH, SLOT_WIDTH } from './Const'
// import { useEffectNode } from './State'

export function SquareSlot({ io = 'input', bus, onClickSlot = () => {} }) {
  const [mode, setMode] = useState('ready')
  const color = io === 'input' ? '#00ff00' : '#0000ff'
  const lighterColor = useMemo(() => {
    return new Color(color).offsetHSL(0, 0, 0.1)
  }, [color])
  const dimmerColor = useMemo(() => {
    return new Color(color).offsetHSL(0, -0.3, -0.1)
  }, [color])

  const getColor = () => {
    if (mode === 'ready') {
      return color
    } else if (mode === 'down') {
      return dimmerColor
    } else if (mode === 'hover') {
      return lighterColor
    }
  }

  return (
    <mesh
      position-x={-2.5}
      position-y={1}
      position-z={io === 'input' ? SLOT_WIDTH / 2 : -SLOT_WIDTH / 2}
      onPointerMove={() => {
        bus.dispatchEvent({ type: 'disable-ctrl' })
      }}
      onPointerOver={(e) => {
        setMode('hover')

        bus.dispatchEvent({ type: 'disable-ctrl' })
      }}
      onPointerDown={(e) => {
        setMode('down')

        bus.dispatchEvent({ type: 'disable-ctrl' })
      }}
      onPointerUp={(e) => {
        setMode('hover')

        bus.dispatchEvent({ type: 'disable-ctrl' })
      }}
      onPointerOut={(e) => {
        setMode('ready')

        bus.dispatchEvent({ type: 'enable-ctrl' })
      }}
      onClick={onClickSlot}
    >
      <boxBufferGeometry args={[5, 1, 5, 24, 24]} />
      <meshBasicMaterial color={getColor()} />
    </mesh>
  )
}
